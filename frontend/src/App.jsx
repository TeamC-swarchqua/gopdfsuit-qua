import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AuthGuard from './components/AuthGuard'
import Home from './pages/Home'
import Login from './pages/Login'
import Editor from './pages/Editor'
import Viewer from './pages/Viewer'
import Merge from './pages/Merge'
import Split from './pages/Split'
import Filler from './pages/Filler'
import HtmlToPdf from './pages/HtmlToPdf'
import HtmlToImage from './pages/HtmlToImage'
import Screenshots from './pages/Screenshots'
import Comparison from './pages/Comparison'
import Documentation from './pages/Documentation'
import Redaction from './pages/Redaction'

/**
 * All tool routes are wrapped by AuthGuard so that unauthenticated users
 * are redirected to /login. The login page itself is public.
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Public: authentication page */}
          <Route path="/login" element={<Login />} />

          {/* Protected: all PDF tools */}
          <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
          <Route path="/viewer" element={<AuthGuard><Viewer /></AuthGuard>} />
          <Route path="/editor" element={<AuthGuard><Editor /></AuthGuard>} />
          <Route path="/merge" element={<AuthGuard><Merge /></AuthGuard>} />
          <Route path="/split" element={<AuthGuard><Split /></AuthGuard>} />
          <Route path="/filler" element={<AuthGuard><Filler /></AuthGuard>} />
          <Route path="/htmltopdf" element={<AuthGuard><HtmlToPdf /></AuthGuard>} />
          <Route path="/htmltoimage" element={<AuthGuard><HtmlToImage /></AuthGuard>} />
          <Route path="/screenshots" element={<AuthGuard><Screenshots /></AuthGuard>} />
          <Route path="/comparison" element={<AuthGuard><Comparison /></AuthGuard>} />
          <Route path="/redact" element={<AuthGuard><Redaction /></AuthGuard>} />
          <Route path="/documentation" element={<AuthGuard><Documentation /></AuthGuard>} />

          {/* Fallback: redirect unknown paths to home (which guards itself) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
