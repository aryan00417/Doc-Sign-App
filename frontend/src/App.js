import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import DocumentPreview from './pages/DocumentPreview'
import SignatureEditor from './pages/SignatureEditor'
import PublicSign from './pages/PublicSign'

// Protect routes — redirect to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/docs/:id" element={<PrivateRoute><DocumentPreview /></PrivateRoute>} />
      <Route path="/docs/:id/editor" element={<PrivateRoute><SignatureEditor /></PrivateRoute>} />
      <Route path="/sign/:token" element={<PublicSign />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}