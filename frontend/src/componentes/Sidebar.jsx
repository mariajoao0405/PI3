import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.tipo_utilizador);
        setUserData(decoded);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const getMenuItems = () => {
    const baseItems = {
      administrador: [
        { 
          label: 'Dashboard', 
          path: '/admin', 
          icon: 'bi-speedometer2' 
        },
        { 
          label: 'Gestores', 
          path: '/admin/gestores', 
          icon: 'bi-people' 
        },
        { 
          label: 'Estudantes', 
          path: '/admin/estudantes', 
          icon: 'bi-mortarboard' 
        },
        { 
          label: 'Ver Propostas', 
          path: '/admin/ver-propostas', 
          icon: 'bi-file-earmark-text' 
        },
        { 
          label: 'Criar Proposta', 
          path: '/admin/criar-proposta', 
          icon: 'bi-plus-circle' 
        }
      ],
      estudante: [
        { 
          label: 'Dashboard', 
          path: '/estudante', 
          icon: 'bi-speedometer2' 
        },
        { 
          label: 'Ver as minhas propostas', 
          path: '/estudante/propostas', 
          icon: 'bi-file-earmark-text' 
        },
        {
          label:'Ver todas as propostas',
          path: '/estudante/todas-propostas',
          icon: 'bi-file-earmark-text'
        }
      ],
      empresa: [
        { 
          label: 'Dashboard', 
          path: '/empresa', 
          icon: 'bi-speedometer2' 
        },
        { 
          label: 'Criar Proposta', 
          path: '/empresa/criar-proposta', 
          icon: 'bi-plus-circle' 
        },
        { 
          label: 'Ver as minhas Propostas', 
          path: '/empresa/ver-propostas', 
          icon: 'bi-file-earmark-text' 
        },
        {
          label:'Ver todas as Propostas',
          path:'/empresa/todas-propostas',
          icon: 'bi-file-earmark-text'
        }
      ],
      gestor: [
        { 
          label: 'Dashboard', 
          path: '/gestor', 
          icon: 'bi-speedometer2' 
        },
        { 
          label: 'Criar Proposta', 
          path: '/gestor/criar-proposta', 
          icon: 'bi-plus-circle' 
        },
        { 
          label: 'Ver Propostas', 
          path: '/gestor/ver-propostas', 
          icon: 'bi-file-earmark-text' 
        },
        { 
          label: 'Ver Estudantes', 
          path: '/gestor/estudantes', 
          icon: 'bi-mortarboard' 
        }
      ]
    };

    return baseItems[userRole] || [];
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // CORREÇÃO: Adicionei o 'gestor' aqui
  const getRoleDisplayName = (role) => {
    const roleNames = {
      administrador: 'Administrador',
      estudante: 'Estudante',
      empresa: 'Empresa',
      gestor: 'Gestor' // ← ESTAVA A FALTAR ISTO
    };
    return roleNames[role] || role;
  };

  // CORREÇÃO: Adicionei o ícone para 'gestor' aqui
  const getRoleIcon = (role) => {
    const roleIcons = {
      administrador: 'bi-shield-check',
      estudante: 'bi-mortarboard',
      empresa: 'bi-building',
      gestor: 'bi-person-gear' // ← ESTAVA A FALTAR ISTO
    };
    return roleIcons[role] || 'bi-person';
  };

  if (!userRole) return null;

  return (
    <div className="sidebar bg-light border-end" style={{ width: '250px', minHeight: '100vh' }}>
      {/* Header */}
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center">
          <i className="bi bi-link-45deg text-primary fs-4 me-2"></i>
          <div>
            <h6 className="mb-0 text-primary fw-bold">FutureLink</h6>
            <small className="text-muted">Platform</small>
          </div>
        </div>
      </div>

      {/* User Info - CORREÇÃO: Usei a função getRoleIcon */}
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
               style={{ width: '40px', height: '40px' }}>
            <i className={`bi ${getRoleIcon(userRole)}`}></i>
          </div>
          <div>
            <h6 className="mb-0">{userData?.nome || 'Utilizador'}</h6>
            <small className="text-muted">{getRoleDisplayName(userRole)}</small>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-3">
        <ul className="nav nav-pills flex-column">
          {getMenuItems().map((item, index) => (
            <li className="nav-item mb-2" key={index}>
              <button
                className={`nav-link w-100 text-start d-flex align-items-center ${
                  isActiveRoute(item.path) ? 'active' : 'text-dark'
                }`}
                onClick={() => navigate(item.path)}
                style={{ 
                  border: 'none', 
                  backgroundColor: isActiveRoute(item.path) ? '#0d6efd' : 'transparent',
                  color: isActiveRoute(item.path) ? 'white' : '#212529'
                }}
              >
                <i className={`bi ${item.icon} me-3`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-auto p-3 border-top">
        <button 
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;