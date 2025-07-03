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
import AdminEditProposal from './pages/AdminEditProposal.jsx'


//PAGINAS DE ESTUDANTE
import StudantDashboard from './pages/StudantDashboard.jsx'
import StudantProfile from './pages/StudantProfile.jsx'
import StudentProposals from './pages/StudantProposals.jsx'

//PAGINAS DE EMPRESA
import EmpresaDashboard from './pages/CompanyDashBoard.jsx'
import EmpresaProfile from './pages/CompanyProfile.jsx'
import EmpresaCreateProposal from './pages/CompanyCreateProposal.jsx'
import EmpresaViewProposal from './pages/CompanyViewProposal'
import EmpresaEditProposal from './pages/CompanyEditProposal.jsx'


//PAGINAS DE GESTOR
import DepartmentDashboard from './pages/DepartmentGestor.jsx'
import DepartmentCreateProposals from './pages/DepartmentCreateProposal.jsx'
import DepartmentViewProposals from './pages/DepartmentViewProposals.jsx'
import DepartmentEditProposal from './pages/DepartmentEditProposal.jsx'


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
      <Route path="/admin/editar-proposta/:proposal_id" element={<ProtectedRoute element={<AdminEditProposal/>} allowedRoles={['administrador']} />} />

      {/* rotas protegias = Estudante */}
      <Route path="/estudante" element={<ProtectedRoute element={<StudantDashboard/>} allowedRoles={['estudante']} />} />
      <Route path="/perfil-estudante/:user_id" element={<ProtectedRoute element={<StudantProfile/>} allowedRoles={['estudante']} />} />
      <Route path="/estudante/propostas" element={<ProtectedRoute element={<StudentProposals/>} allowedRoles={['estudante']} />} />
      
      {/* rotas protegidas = EMPRESA */}
      <Route path="/empresa" element={<ProtectedRoute element={<EmpresaDashboard/>} allowedRoles={['empresa']} />} />
      <Route path="/perfil-empresa/:user_id" element={<ProtectedRoute element={<EmpresaProfile/>} allowedRoles={['empresa']} />} />
      <Route path="/empresa/criar-proposta" element={<ProtectedRoute element={<EmpresaCreateProposal/>} allowedRoles={['empresa']} />} />
      <Route path ="/empresa/ver-propostas" element={<ProtectedRoute element={<EmpresaViewProposal/>} allowedRoles={['empresa']} />} />
      <Route path="/empresa/editar-proposta/:proposal_id" element={<ProtectedRoute element={<EmpresaEditProposal/>} allowedRoles={['empresa']} />} />

      {/* rotas protegidas = GESTOR */}
     <Route path="/gestor" element={<ProtectedRoute element={<DepartmentDashboard/>} allowedRoles={['gestor']} />} />
      <Route path="/gestor/criar-proposta" element={<ProtectedRoute element={<DepartmentCreateProposals/>} allowedRoles={['gestor']} />} />
      <Route path="/gestor/ver-propostas" element={<ProtectedRoute element={<DepartmentViewProposals/>} allowedRoles={['gestor']} />} />
      <Route path="/gestor/editar-proposta/:proposal_id" element={<ProtectedRoute element={<DepartmentEditProposal/>} allowedRoles={['gestor']} />} />

    </Routes>
  )
}

export default App
