package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// newTestServer builds a fresh server backed by an in-memory SQLite store.
func newTestServer(t *testing.T) (*gin.Engine, *Store, *TokenManager) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	store, err := OpenStore(":memory:")
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	t.Cleanup(func() { _ = store.Close() })
	tm := NewTokenManager("test-secret", time.Hour)
	return newServer(store, tm, "*"), store, tm
}

func postJSON(t *testing.T, r http.Handler, path string, body any) *httptest.ResponseRecorder {
	t.Helper()
	b, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// FR-AUTH-01 — El endpoint /auth/register acepta JSON con email y password
// (contrato de la vista de login/registro).
func TestFR_AUTH_01_RegisterEndpointAcceptsJSON(t *testing.T) {
	r, _, _ := newTestServer(t)
	w := postJSON(t, r, "/auth/register", map[string]string{
		"email":    "u1@example.com",
		"password": "supersecret",
	})
	if w.Code == http.StatusNotFound || w.Code == http.StatusMethodNotAllowed {
		t.Fatalf("endpoint /auth/register no disponible: code=%d", w.Code)
	}
	t.Logf("FR-AUTH-01 OK: /auth/register acepta JSON | code=%d | body=%s", w.Code, w.Body.String())
}

// FR-AUTH-02 — Registra un nuevo usuario cuando el correo no existe y la
// contraseña tiene al menos 8 caracteres.
func TestFR_AUTH_02_RegisterNewUser(t *testing.T) {
	r, _, _ := newTestServer(t)
	w := postJSON(t, r, "/auth/register", map[string]string{
		"email":    "nuevo@example.com",
		"password": "supersecret",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("esperado 201, obtenido %d: %s", w.Code, w.Body.String())
	}
	var resp tokenResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("respuesta no parseable: %v", err)
	}
	if resp.Token == "" || resp.User.Email != "nuevo@example.com" {
		t.Fatalf("token o user vacíos: %+v", resp)
	}
	t.Logf("FR-AUTH-02 OK | code=%d | token.len=%d | user.id=%d | user.email=%s", w.Code, len(resp.Token), resp.User.ID, resp.User.Email)
}

// FR-AUTH-03 — Tras un registro exitoso, el usuario queda autenticado: el
// token emitido es válido y /auth/verify lo acepta (acceso a herramientas).
func TestFR_AUTH_03_RegisterIssuesValidToken(t *testing.T) {
	r, _, _ := newTestServer(t)
	w := postJSON(t, r, "/auth/register", map[string]string{
		"email":    "auth@example.com",
		"password": "supersecret",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("registro falló: code=%d body=%s", w.Code, w.Body.String())
	}
	var resp tokenResponse
	_ = json.Unmarshal(w.Body.Bytes(), &resp)

	req := httptest.NewRequest(http.MethodGet, "/auth/verify", nil)
	req.Header.Set("Authorization", "Bearer "+resp.Token)
	vw := httptest.NewRecorder()
	r.ServeHTTP(vw, req)

	if vw.Code != http.StatusOK {
		t.Fatalf("verify rechazó token recién emitido: %d %s", vw.Code, vw.Body.String())
	}
	if !strings.Contains(vw.Body.String(), `"valid":true`) {
		t.Fatalf("verify no devolvió valid:true: %s", vw.Body.String())
	}
	t.Logf("FR-AUTH-03 OK | /verify code=%d | body=%s", vw.Code, vw.Body.String())
}

// FR-AUTH-04 — Si el correo ya está registrado, se responde con error de
// duplicado (409 Conflict, mensaje "email already registered").
func TestFR_AUTH_04_RegisterDuplicateEmail(t *testing.T) {
	r, _, _ := newTestServer(t)
	body := map[string]string{"email": "dup@example.com", "password": "supersecret"}
	w1 := postJSON(t, r, "/auth/register", body)
	if w1.Code != http.StatusCreated {
		t.Fatalf("primer registro falló: %d %s", w1.Code, w1.Body.String())
	}
	w2 := postJSON(t, r, "/auth/register", body)
	if w2.Code != http.StatusConflict {
		t.Fatalf("esperado 409 en duplicado, obtenido %d: %s", w2.Code, w2.Body.String())
	}
	if !strings.Contains(w2.Body.String(), "already registered") {
		t.Fatalf("mensaje de error no menciona duplicado: %s", w2.Body.String())
	}
	t.Logf("FR-AUTH-04 OK | 1er registro code=%d | duplicado code=%d | body=%s", w1.Code, w2.Code, w2.Body.String())
}

// FR-AUTH-05 — Credenciales inválidas: el login con password incorrecta
// debe devolver 401 y no emitir token.
func TestFR_AUTH_05_LoginInvalidCredentials(t *testing.T) {
	r, _, _ := newTestServer(t)
	_ = postJSON(t, r, "/auth/register", map[string]string{
		"email": "u5@example.com", "password": "supersecret",
	})
	w := postJSON(t, r, "/auth/login", map[string]string{
		"email": "u5@example.com", "password": "wrongpassword",
	})
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401, obtenido %d: %s", w.Code, w.Body.String())
	}
	if strings.Contains(w.Body.String(), `"token"`) {
		t.Fatalf("no debería emitir token en login fallido: %s", w.Body.String())
	}
	t.Logf("FR-AUTH-05 OK | code=%d | body=%s", w.Code, w.Body.String())
}

// FR-AUTH-06 — El backend debe rechazar operaciones protegidas cuando no se
// presenta el token. /auth/verify sin header Authorization debe dar 401.
func TestFR_AUTH_06_ProtectedOperationsRequireToken(t *testing.T) {
	r, _, _ := newTestServer(t)
	req := httptest.NewRequest(http.MethodGet, "/auth/verify", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401 sin token, obtenido %d", w.Code)
	}
	t.Logf("FR-AUTH-06 OK | code=%d | body=%s", w.Code, w.Body.String())
}

// FR-AUTH-07 — Password con menos de 8 caracteres debe ser rechazada en el
// registro (regla de validación de modelo).
func TestFR_AUTH_07_RejectShortPassword(t *testing.T) {
	r, _, _ := newTestServer(t)
	w := postJSON(t, r, "/auth/register", map[string]string{
		"email": "shortpw@example.com", "password": "abc123",
	})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("esperado 400 por password corta, obtenido %d: %s", w.Code, w.Body.String())
	}
	t.Logf("FR-AUTH-07 OK | code=%d | body=%s", w.Code, w.Body.String())
}

// FR-AUTH-08 — Las contraseñas se almacenan hasheadas con bcrypt; el hash
// nunca debe coincidir con el plaintext.
func TestFR_AUTH_08_PasswordsAreHashed(t *testing.T) {
	r, store, _ := newTestServer(t)
	plain := "supersecret"
	_ = postJSON(t, r, "/auth/register", map[string]string{
		"email": "hash@example.com", "password": plain,
	})
	_, hash, err := store.Credentials("hash@example.com")
	if err != nil {
		t.Fatalf("no se pudo recuperar usuario: %v", err)
	}
	if hash == plain {
		t.Fatalf("contraseña almacenada en texto plano")
	}
	if !strings.HasPrefix(hash, "$2") {
		t.Fatalf("hash no parece bcrypt: %s", hash)
	}
	t.Logf("FR-AUTH-08 OK | plaintext=%q | hash_prefix=%s | hash_len=%d | distinto_a_plaintext=%t", plain, hash[:7], len(hash), hash != plain)
}

// FR-AUTH-09 — /auth/verify debe rechazar tokens firmados con un secreto
// distinto (defensa contra tokens falsificados).
func TestFR_AUTH_09_RejectForgedToken(t *testing.T) {
	r, _, _ := newTestServer(t)
	// Token firmado con un secret distinto al del servidor.
	claims := jwt.MapClaims{
		"sub": "1", "email": "attacker@example.com",
		"iss": tokenIssuer,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(time.Hour).Unix(),
	}
	bad, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte("OTHER-secret"))
	req := httptest.NewRequest(http.MethodGet, "/auth/verify", nil)
	req.Header.Set("Authorization", "Bearer "+bad)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401 por token forjado, obtenido %d", w.Code)
	}
	t.Logf("FR-AUTH-09 OK | code=%d | body=%s", w.Code, w.Body.String())
}

// FR-AUTH-10 — La búsqueda de email es case-insensitive: registrar con una
// caja y loguear con otra debe funcionar.
func TestFR_AUTH_10_EmailIsCaseInsensitive(t *testing.T) {
	r, _, _ := newTestServer(t)
	w := postJSON(t, r, "/auth/register", map[string]string{
		"email": "Mixed@Example.com", "password": "supersecret",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("registro falló: %d %s", w.Code, w.Body.String())
	}
	w2 := postJSON(t, r, "/auth/login", map[string]string{
		"email": "mixed@example.com", "password": "supersecret",
	})
	if w2.Code != http.StatusOK {
		t.Fatalf("login case-insensitive falló: %d %s", w2.Code, w2.Body.String())
	}
	var resp2 tokenResponse
	_ = json.Unmarshal(w2.Body.Bytes(), &resp2)
	t.Logf("FR-AUTH-10 OK | registro_code=%d | login_code=%d | login.user.email=%s", w.Code, w2.Code, resp2.User.Email)
}
