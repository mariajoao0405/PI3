import React from 'react'
import {Routes, Route} from 'react-router-dom'
import Registo from './pages/Registo.jsx'
import Login from './pages/Login.jsx'
import ProtectedRoute from './componentes/ProtectedRoute.jsx'

//PAGINAS DE ADMIN
import AdminPage from './pages/AdminPage.jsx'
import AdminViewDepartment from './pages/AdminViewDepartment.jsx'
import AdminViewStudent from './pages/AdminViewStudents.jsx'


//PAGINAS DE ESTUDANTE
import StudantDashboard from './pages/StudantDashboard.jsx'
import StudantProfile from './pages/StudantProfile.jsx'

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

      {/* rotas protegias = Estudante */}
      <Route path="/estudante" element={<ProtectedRoute element={<StudantDashboard/>} allowedRoles={['estudante']} />} />
      <Route path="/perfil-estudante/:user_id" element={<ProtectedRoute element={<StudantProfile/>} allowedRoles={['estudante']} />} />
      
      {/* rotas protegidas = EMPRESA */}
      {/* <Route path="/empresa" element={<ProtectedRoute element={<EmpresaPage/>} allowedRoles={['empresa']} />} /> */}

      {/* rotas protegidas = GESTOR */}
      {/* <Route path="/gestor" element={<ProtectedRoute element={<GestorPage/>} allowedRoles={['gestor']} />} /> */}
    </Routes>
  )
}

export default App
