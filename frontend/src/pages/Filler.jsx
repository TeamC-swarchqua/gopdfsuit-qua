import { useState, useRef } from 'react'
import { FileCheck, Upload, Download, RefreshCw, FileText, Sparkles } from 'lucide-react'
import { makeAuthenticatedRequest } from '../utils/apiConfig'
import { useAuth } from '../contexts/AuthContext'
import BackgroundAnimation from '../components/BackgroundAnimation'

const Filler = () => {
  const [pdfFile, setPdfFile] = useState(null)
  const [xfdfFile, setXfdfFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filledPdfUrl, setFilledPdfUrl] = useState('')
  const pdfInputRef = useRef(null)
  const xfdfInputRef = useRef(null)
  const { getAuthHeaders, triggerLogin } = useAuth()

  const handlePdfUpload = (event) => { const file = event.target.files[0]; if (file?.type === 'application/pdf') setPdfFile(file) }
  const handleXfdfUpload = (event) => { const file = event.target.files[0]; if (file) setXfdfFile(file) }

  const fillPDF = async () => {
    if (!pdfFile || !xfdfFile) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile); formData.append('xfdf', xfdfFile)
      const response = await makeAuthenticatedRequest('/api/v1/fill', { method: 'POST', body: formData }, getAuthHeaders)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setFilledPdfUrl(url)
      const link = document.createElement('a'); link.href = url; link.download = `filled-${pdfFile.name}`; link.click()
    } catch (error) {
      if (error.message.includes("401") || error.message.includes("403")) triggerLogin()
      else alert('Error al rellenar el PDF: ' + error.message)
    } finally { setIsLoading(false) }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 bytes'
    const k = 1024, sizes = ['bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const FileUploadBox = ({ file, label, onClick }) => (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'hsl(var(--foreground))', fontWeight: '600', fontSize: '0.9rem' }}>{label}</label>
      <div onClick={onClick} style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', background: 'rgba(255,255,255,0.02)' }}>
        <FileText size={32} style={{ color: file ? '#ff493b' : 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }} />
        <p style={{ color: file ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', marginBottom: '0.25rem', fontWeight: file ? '500' : '400' }}>{file ? file.name : `Haz clic para subir ${label.split(' ')[0]}`}</p>
        {file && <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginBottom: 0 }}>{formatFileSize(file.size)}</p>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <BackgroundAnimation />
      <section style={{ padding: '4rem 0 2rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '50px', marginBottom: '1.5rem', color: '#10b981', fontSize: '0.9rem', fontWeight: '500' }}>
            <Sparkles size={16} />Relleno de formularios
          </div>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: '800', color: 'hsl(var(--foreground))' }}>
            <div className="feature-icon-box green" style={{ width: '56px', height: '56px', marginBottom: 0 }}><FileCheck size={28} /></div>
            Rellenar formularios PDF
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Rellena formularios PDF con un archivo de datos XFDF</p>
        </div>
      </section>

      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: '700' }}>
                <div className="feature-icon-box blue" style={{ width: '40px', height: '40px', marginBottom: 0 }}><Upload size={18} /></div>Subir archivos
              </h3>
              <input ref={pdfInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} style={{ display: 'none' }} />
              <input ref={xfdfInputRef} type="file" accept=".xfdf,.xml" onChange={handleXfdfUpload} style={{ display: 'none' }} />

              <div style={{ marginBottom: '1.5rem' }}>
                <FileUploadBox file={pdfFile} label="PDF (formulario):" onClick={() => pdfInputRef.current?.click()} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <FileUploadBox file={xfdfFile} label="XFDF (datos del formulario):" onClick={() => xfdfInputRef.current?.click()} />
              </div>

              <button onClick={fillPDF} disabled={isLoading || !pdfFile || !xfdfFile} className="btn-glow" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 2rem' }}>
                {isLoading ? <RefreshCw size={18} className="spin" /> : <FileCheck size={18} />}Rellenar formulario PDF
              </button>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: '700' }}>
                <div className="feature-icon-box purple" style={{ width: '40px', height: '40px', marginBottom: 0 }}><FileText size={18} /></div>Vista previa del PDF rellenado
              </h3>
              {filledPdfUrl ? (
                <div>
                  <iframe src={filledPdfUrl} style={{ width: '100%', height: '550px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', overflow: 'hidden' }} title="PDF rellenado" />
                  <button onClick={() => { const link = document.createElement('a'); link.href = filledPdfUrl; link.download = `filled-${pdfFile?.name || 'form.pdf'}`; link.click() }} className="btn-glow" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                    <Download size={16} />Descargar PDF rellenado
                  </button>
                </div>
              ) : (
                <div style={{ height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.1)', color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
                  <div>
                    <div className="feature-icon-box green" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5 }}><FileCheck size={32} /></div>
                    <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Aquí verás la vista previa del PDF rellenado</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: 0 }}>Sube el archivo PDF y el archivo XFDF</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ marginTop: '2rem', padding: '2rem' }}>
            <h3 style={{ color: 'hsl(var(--foreground))', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: '700' }}>
              <div className="feature-icon-box yellow" style={{ width: '40px', height: '40px', marginBottom: 0 }}><span style={{ fontSize: '1.2rem' }}>📋</span></div>Cómo usar
            </h3>
            <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <h4 style={{ color: '#ff493b', marginBottom: '0.75rem', fontSize: '1rem' }}>Pasos:</h4>
                <ol style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 2, paddingLeft: '1.5rem', marginBottom: 0 }}>
                  <li>Sube un archivo PDF con campos de formulario</li>
                  <li>Sube un archivo XFDF con los datos del formulario</li>
                  <li>Haz clic en &quot;Rellenar formulario PDF&quot; para procesarlo</li>
                  <li>Revisa la vista previa y descarga el PDF rellenado</li>
                </ol>
              </div>
              <div>
                <h4 style={{ color: '#ff493b', marginBottom: '0.75rem', fontSize: '1rem' }}>Requisitos de los archivos:</h4>
                <ul style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 2, paddingLeft: '1.5rem', marginBottom: 0 }}>
                  <li><strong>PDF:</strong> Debe tener campos de formulario</li>
                  <li><strong>XFDF:</strong> Archivo XML con los datos de los campos</li>
                  <li>Los nombres de los campos en XFDF deben coincidir con el PDF</li>
                  <li>Compatible con texto, casillas y botones de opción</li>
                </ul>
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(255,73,59,0.08)', borderRadius: '8px', border: '1px solid rgba(255,73,59,0.2)' }}>
              <h4 style={{ color: '#ff493b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}><FileText size={16} />Archivos de ejemplo disponibles</h4>
              <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: 0, fontSize: '0.9rem' }}>Consulta la carpeta <code style={{ color: '#ff493b', background: 'rgba(255,73,59,0.15)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>sampledata/</code> para ver archivos de ejemplo.</p>
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`.spin{animation:spin 1s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default Filler