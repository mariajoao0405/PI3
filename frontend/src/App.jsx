import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Registo from './pages/Registo.jsx'
import Login from './pages/Login.jsx'
import ProtectedRoute from './componentes/ProtectedRoute.jsx'

//PAGINAS DE ADMIN
import AdminPage from './pages/AdminPage.jsx'
import AdminViewDepartment from './pages/AdminViewDepartment.jsx'
import AdminViewStudent from './pages/AdminViewStudents.jsx'
import AdminCreateProposal from './pages/AdminCreateProposal.jsx'
import AdminViewProposal from './pages/AdminViewProposals.jsx'


//PAGINAS DE ESTUDANTE
import StudantDashboard from './pages/StudantDashboard.jsx'
import StudantProfile from './pages/StudantProfile.jsx'

//PAGINAS DE EMPRESA
import EmpresaDashboard from './pages/CompanyDashBoard.jsx'
import EmpresaProfile from './pages/CompanyProfile.jsx'
import EmpresaCreateProposal from './pages/CompanyCreateProposal.jsx'

function App() {

  return (
    <Routes>
      <Route path="/registo" element={<Registo />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      {/* rotas protegidas = ADMIN */}
      <Route path="/admin" element={<ProtectedRoute element={<AdminPage/>} allowedRoles={['administrador']} />} />
      <Route path="/admin/gestores" element={<ProtectedRoute element={<AdminViewDepartment/>} allowedRoles={['administrador']} />} />
      <Route path="/admin/estudantes" element={<ProtectedRoute element={<AdminViewStudent/>} allowedRoles={['administrador']} />} />
      <Route path="/admin/criar-proposta" element={<ProtectedRoute element={<AdminCreateProposal/>} allowedRoles={['administrador']} />} />
      <Route path="/admin/ver-propostas" element={<ProtectedRoute element={<AdminViewProposal/>} allowedRoles={['administrador']}/>} />

      {/* rotas protegias = Estudante */}
      <Route path="/estudante" element={<ProtectedRoute element={<StudantDashboard/>} allowedRoles={['estudante']} />} />
      <Route path="/perfil-estudante/:user_id" element={<ProtectedRoute element={<StudantProfile/>} allowedRoles={['estudante']} />} />
      
      {/* rotas protegidas = EMPRESA */}
      <Route path="/empresa" element={<ProtectedRoute element={<EmpresaDashboard/>} allowedRoles={['empresa']} />} />
      <Route path="/perfil-empresa/:user_id" element={<ProtectedRoute element={<EmpresaProfile/>} allowedRoles={['empresa']} />} />
      <Route path="/empresa/criar-proposta" element={<ProtectedRoute element={<EmpresaCreateProposal/>} allowedRoles={['empresa']} />} />

      {/* rotas protegidas = GESTOR */}
      {/* <Route path="/gestor" element={<ProtectedRoute element={<GestorPage/>} allowedRoles={['gestor']} />} /> */}
    </Routes>
  )
}

export default App
