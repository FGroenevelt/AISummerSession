import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Bedankt from './pages/Bedankt'
import Overzicht from './pages/Overzicht'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bedankt" element={<Bedankt />} />
        <Route path="/overzicht" element={<Overzicht />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
