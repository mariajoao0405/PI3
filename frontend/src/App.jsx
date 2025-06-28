import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Registo from './pages/Registo.jsx'
import Login from './pages/Login.jsx'
import AdminPage from './pages/AdminPage.jsx'

function App() {

  return (
    <Routes>
      <Route path="/registo" element={<Registo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminPage />} />
      {/* Rotas temporárias para outras roles - crie os componentes necessários */}
      <Route path="/departamento" element={<div>Página do Departamento - Em construção</div>} />
      <Route path="/empresa" element={<div>Página da Empresa - Em construção</div>} />
      <Route path="/propostas" element={<div>Página de Propostas (Estudante) - Em construção</div>} />
      <Route path="/recuperarPassword" element={<div>Página de Recuperação de Password - Em construção</div>} />
    </Routes>
  )
}

export default App
