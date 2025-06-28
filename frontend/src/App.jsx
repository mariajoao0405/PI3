import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Registo from './pages/Registo.jsx'
import Login from './pages/Login.jsx'
import AdminPage from './pages/AdminPage.jsx'
import ProtectedRoute from './componentes/ProtectedRoute.jsx'

function App() {

  return (
    <Routes>
      <Route path="/registo" element={<Registo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />



      {/* rotas protegidas = ADMIN */}
      <Route path="/admin" element={<ProtectedRoute element={<AdminPage/>} allowedRoles={['administrador']} />} />
    </Routes>
  )
}

export default App
