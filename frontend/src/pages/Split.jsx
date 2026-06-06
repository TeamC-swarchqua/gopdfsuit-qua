import { useState, useRef } from 'react'
import { Scissors, Upload, Download, RefreshCw, FileText, X, Sparkles } from 'lucide-react'
import { makeAuthenticatedRequest } from '../utils/apiConfig'
import { useAuth } from '../contexts/AuthContext'
import BackgroundAnimation from '../components/BackgroundAnimation'

const SplitPage = () => {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState('')
  const [maxPerFile, setMaxPerFile] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [splitPdfUrl, setSplitPdfUrl] = useState('')
  const fileInputRef = useRef(null)
  const { getAuthHeaders, triggerLogin } = useAuth()

  const handleFileUpload = (event) => {
    const selectedFile = Array.from(event.target.files).find(f => f.type === 'application/pdf')
    if (selectedFile) setFile(selectedFile)
    event.target.value = ''
  }

  const removeFile = () => { setFile(null); setSplitPdfUrl('') }

  const splitPDF = async () => {
    if (!file) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      if (pages) formData.append('pages', pages)
      if (maxPerFile) formData.append('max_per_file', maxPerFile)
      const response = await makeAuthenticatedRequest('/api/v1/split', { method: 'POST', body: formData }, getAuthHeaders)
      const blob = await response.blob()
      setSplitPdfUrl(URL.createObjectURL(blob))
    } catch (error) {
      if (error.message.includes("401") || error.message.includes("403")) triggerLogin()
      else alert('Error al dividir el PDF: ' + error.message)
    } finally { setIsLoading(false) }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 bytes'
    const k = 1024, sizes = ['bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const inputStyles = { width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--foreground))', fontSize: '0.95rem' }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <BackgroundAnimation />
      <section style={{ padding: '4rem 0 2rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '50px', marginBottom: '1.5rem', color: '#ffc107', fontSize: '0.9rem', fontWeight: '500' }}>
            <Sparkles size={16} />Extraer y dividir páginas
          </div>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '800', color: 'hsl(var(--foreground))' }}>
            <div className="feature-icon-box yellow" style={{ width: '56px', height: '56px', marginBottom: 0 }}><Scissors size={28} /></div>
            Herramienta para dividir PDF
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Extrae páginas concretas o divide un PDF en varios archivos</p>
        </div>
      </section>

      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: '700' }}>
                <div className="feature-icon-box blue" style={{ width: '40px', height: '40px', marginBottom: 0 }}><Upload size={18} /></div>Subir archivo PDF
              </h3>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
              <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '8px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)' }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#ff493b'; e.currentTarget.style.background = 'rgba(255,73,59,0.1)' }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onDrop={(e) => { e.preventDefault(); const f = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf'); if (f) setFile(f); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}>
                <div className="feature-icon-box teal" style={{ width: '56px', height: '56px', margin: '0 auto 1rem', opacity: 0.6 }}><Upload size={28} /></div>
                <p style={{ color: 'hsl(var(--foreground))', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Haz clic para subir o arrastra aquí</p>
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', marginBottom: 0 }}>Selecciona un archivo PDF para dividir</p>
              </div>

              {file && (
                <div>
                  <h4 style={{ color: 'hsl(var(--foreground))', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '600' }}>Archivo seleccionado</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,73,59,0.08)', border: '1px solid rgba(255,73,59,0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <FileText size={18} style={{ color: '#ff493b' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'hsl(var(--foreground))', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>{file.name}</div>
                      <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>{formatFileSize(file.size)}</div>
                    </div>
                    <button onClick={removeFile} style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', color: '#ff6b6b', borderRadius: '6px', padding: '0.4rem 0.6rem', cursor: 'pointer' }}><X size={14} /></button>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--foreground))', fontWeight: '600', fontSize: '0.9rem' }}>Páginas (opcional)</label>
                    <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="ej. 1-3,5" style={inputStyles} disabled={isLoading} />
                    <small style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>Indica qué páginas quieres o déjalo vacío</small>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--foreground))', fontWeight: '600', fontSize: '0.9rem' }}>Máximo por archivo (opcional)</label>
                    <input type="number" min="1" value={maxPerFile} onChange={(e) => setMaxPerFile(e.target.value)} placeholder="ej. 1" style={inputStyles} disabled={isLoading} />
                    <small style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem' }}>Divide en archivos con este número de páginas cada uno</small>
                  </div>
                  <button onClick={splitPDF} disabled={isLoading} className="btn-glow" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem' }}>
                    {isLoading ? <RefreshCw size={18} className="spin" /> : <Scissors size={18} />}Dividir PDF
                  </button>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: '700' }}>
                <div className="feature-icon-box purple" style={{ width: '40px', height: '40px', marginBottom: 0 }}><FileText size={18} /></div>Vista previa del PDF dividido
              </h3>
              {splitPdfUrl ? (
                <div>
                  <iframe src={splitPdfUrl} style={{ width: '100%', height: '550px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', overflow: 'hidden' }} title="PDF dividido" />
                  <button onClick={() => { const link = document.createElement('a'); link.href = splitPdfUrl; link.download = `split-pdf-${Date.now()}.pdf`; link.click() }} className="btn-glow" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                    <Download size={16} />Descargar PDF dividido
                  </button>
                </div>
              ) : (
                <div style={{ height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.1)', color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
                  <div>
                    <div className="feature-icon-box yellow" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5 }}><Scissors size={32} /></div>
                    <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Aquí verás la vista previa del PDF dividido</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: 0 }}>Sube un archivo PDF para empezar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ marginTop: '2rem', padding: '2rem' }}>
            <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>
              <div className="feature-icon-box green" style={{ width: '40px', height: '40px', marginBottom: 0 }}><span style={{ fontSize: '1.2rem' }}>📋</span></div>Cómo usar
            </h3>
            <div className="grid grid-3" style={{ gap: '1.5rem' }}>
              {[{ num: '1️⃣', title: 'Sube el PDF', desc: 'Haz clic o arrastra un archivo PDF' },
              { num: '2️⃣', title: 'Configura', desc: 'Indica las páginas o el máximo por archivo' },
              { num: '3️⃣', title: 'Divide', desc: 'Haz clic en "Dividir PDF" para extraer y descargar' }].map((step, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{step.num}</div>
                  <h4 style={{ color: '#ff493b', marginBottom: '0.5rem', fontSize: '1rem' }}>{step.title}</h4>
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', marginBottom: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default SplitPage
