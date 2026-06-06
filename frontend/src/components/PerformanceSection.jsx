const headlineStats = [
  { value: '10.88 ms', label: 'Media mínima', color: '#ff493b', bg: 'rgba(255, 73, 59, 0.1)', border: 'rgba(255, 73, 59, 0.3)' },
  { value: '783.34 ops/seg', label: 'Rendimiento máximo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
  { value: '9.47 ms', label: 'Tiempo mínimo', color: '#e63d30', bg: 'rgba(255, 73, 59, 0.1)', border: 'rgba(255, 73, 59, 0.3)' },
  { value: '12.53 ms', label: 'Tiempo máximo', color: '#ffc107', bg: 'rgba(255, 193, 7, 0.1)', border: 'rgba(255, 193, 7, 0.3)' },
]

const dataBenchmarks = [
  { name: 'GoPDFLib', avg: '119.48 ms', min: '112.51 ms', max: '127.17 ms', throughput: '77.81 ops/seg' },
  { name: 'PDFKit', avg: '905.61 ms', min: '820.49 ms', max: '1002.08 ms', throughput: '8.58 ops/seg' },
  { name: 'jsPDF', avg: '1120.94 ms', min: '1058.14 ms', max: '1187.31 ms', throughput: '7.74 ops/seg' },
  { name: 'Typst', avg: '1323.77 ms', min: '1306.09 ms', max: '1378.97 ms', throughput: '7.22 ops/seg' },
  { name: 'pdf-lib', avg: '2041.23 ms', min: '1904.82 ms', max: '2157.59 ms', throughput: '4.13 ops/seg' },
  { name: 'FPDF2', avg: '4829.08 ms', min: '4734.69 ms', max: '4927.40 ms', throughput: '2.02 ops/seg' },
]

const zerodhaBenchmarks = [
  { name: 'GoPDFLib', throughput: '783.34 ops/seg', avg: '10.88 ms', min: '9.47 ms', max: '12.53 ms' },
  { name: 'GoPDFSuit', throughput: '720.33 ops/seg', avg: '11.70 ms', min: '10.52 ms', max: '12.77 ms' },
  { name: 'PyPDFSuit', throughput: '157.26 ops/seg', avg: '39.53 ms', min: '38.33 ms', max: '40.71 ms' },
]

const parallelWeightedBenchmarks = [
  { name: 'GoPDFLib', workers: '48', throughput: '1913.13 ops/seg', avg: '24.558 ms', min: '2.280 ms', max: '505.087 ms', mix: '4004 / 766 / 230' },
  { name: 'PyPDFSuit', workers: '48', throughput: '233.76 ops/seg', avg: '185.517 ms', min: '2.657 ms', max: '3516.474 ms', mix: '4015 / 767 / 218' },
]

const machineProfile = [
  'Sistema: Linux 6.6.87.2-microsoft-standard-WSL2',
  'Procesador: 13th Gen Intel(R) Core(TM) i7-13700HX',
  'Núcleos: 12 núcleos, 24 procesadores lógicos',
  'Memoria: 7.6 GiB RAM',
]

const BenchmarkPanel = ({ title, description, columns, rows, wide = false }) => (
  <article className={`glass-card performance-panel ${wide ? 'performance-panel-wide' : ''}`}>
    <div className="performance-panel-header">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>

    <div className="performance-table-wrap custom-scrollbar">
      <table className="performance-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              {columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </article>
)

const PerformanceSection = ({ isVisible }) => {
  return (
    <div className={`performance-wrapper animate-fadeInScale stagger-animation ${isVisible ? 'visible' : ''}`}>
      <div className="performance-shell glass-card">
        <div className="performance-header-block">
          <div className="comparison-eyebrow">Pruebas de rendimiento</div>
          <h2 className="gradient-text section-heading" style={{ animationDelay: '0.4s' }}>
            Rendimiento medido
          </h2>
          <p className="section-subheading performance-intro">
            Resultados obtenidos en pruebas locales. Los números principales
            corresponden a la generación de documentos PDF en condiciones reales de uso.
          </p>
        </div>

        <div className="performance-stats-grid">
          {headlineStats.map((stat) => (
            <div
              key={stat.label}
              className="performance-stat-card"
              style={{
                background: stat.bg,
                borderColor: stat.border,
              }}
            >
              <div className="performance-stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="performance-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="performance-panels-grid">
          <BenchmarkPanel
            title="Documento de ejemplo"
            description="Prueba con un documento real para medir la velocidad de generación."
            columns={[
              { key: 'name', label: 'Motor' },
              { key: 'avg', label: 'Media' },
              { key: 'min', label: 'Mín.' },
              { key: 'max', label: 'Máx.' },
              { key: 'throughput', label: 'Rendimiento' },
            ]}
            rows={zerodhaBenchmarks}
          />

          <BenchmarkPanel
            wide
            title="Comparativa de bibliotecas"
            description="Comparación de velocidad entre distintas herramientas de generación de PDF."
            columns={[
              { key: 'name', label: 'Biblioteca' },
              { key: 'avg', label: 'Media' },
              { key: 'min', label: 'Mín.' },
              { key: 'max', label: 'Máx.' },
              { key: 'throughput', label: 'Rendimiento máximo' },
            ]}
            rows={dataBenchmarks}
          />

          <BenchmarkPanel
            title="Carga paralela"
            description="Prueba con múltiples tareas simultáneas para medir el rendimiento en conjunto."
            columns={[
              { key: 'name', label: 'Motor' },
              { key: 'workers', label: 'Procesos' },
              { key: 'throughput', label: 'Rendimiento' },
              { key: 'avg', label: 'Media' },
              { key: 'min', label: 'Mín.' },
              { key: 'max', label: 'Máx.' },
              { key: 'mix', label: 'Mezcla de tareas' },
            ]}
            rows={parallelWeightedBenchmarks}
          />

          <article className="glass-card performance-panel performance-machine-panel">
            <div className="performance-panel-header">
              <h3>Equipo de prueba</h3>
              <p>Configuración del ordenador donde se realizaron las mediciones.</p>
            </div>

            <div className="performance-machine-list">
              {machineProfile.map((line) => (
                <div key={line} className="performance-machine-item">
                  {line}
                </div>
              ))}
            </div>

            <div className="performance-note-box">
              Las tablas individuales miden un documento a la vez. La tabla de carga paralela
              mide el rendimiento con varias tareas simultáneas.
            </div>
          </article>
        </div>

        <p className="performance-disclaimer">
          Las pruebas incluyen generación de PDF con fuentes, marcadores y enlaces internos.
        </p>
      </div>
    </div>
  )
}

export default PerformanceSection
