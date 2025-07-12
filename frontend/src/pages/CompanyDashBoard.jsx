import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar';
import axios from 'axios';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [propostas, setPropostas] = useState([]);

  useEffect(() => {
    // Verificar se é empresa
    const role = getUserRoleFromToken();
    if (role !== 'empresa') {
      navigate('/login');
      return;
    }

    const id = getUserIdFromToken();
    if (!id) {
      navigate('/login');
      return;
    }

    setUserId(id);
    fetchUserData(id);
    fetchRecentProposals(id);
  }, [navigate]);

  const fetchUserData = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`https://pi3-q1c2.onrender.com/users/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  };

  const fetchRecentProposals = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`https://pi3-q1c2.onrender.com/proposals/empresa/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Pegar apenas as 5 propostas mais recentes
      const recentProposals = response.data.data?.slice(0, 5) || [];
      setPropostas(recentProposals);
    } catch (err) {
      console.error('Erro ao carregar propostas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getInitials = (name) => {
    if (!name) return 'EM';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'ativa':
        return <span className="badge bg-success">Ativa</span>;
      case 'pendente':
        return <span className="badge bg-warning text-dark">Pendente</span>;
      case 'inativa':
        return <span className="badge bg-secondary">Inativa</span>;
      case 'rejeitada':
        return <span className="badge bg-danger">Rejeitada</span>;
      default:
        return <span className="badge bg-secondary">Desconhecido</span>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">A carregar...</span>
            </div>
            <p className="mt-2">A carregar dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="container-fluid p-4">
          {/* Header com perfil do usuário */}
          <div className="d-flex justify-content-between align-items-center mb-4 bg-white rounded p-3 shadow-sm">
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
              >
                {getInitials(userData?.nome)}
              </div>
              <div>
                <h5 className="mb-0">{userData?.nome || 'Empresa'}</h5>
                <small className="text-muted">Empresa</small>
              </div>
            </div>
          </div>

          {/* Cards de navegação */}
          <div className="row mb-4">
            {/* Card As minhas Propostas */}
            <div className="col-md-6 mb-3">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#e8f5e8' }}>
                <div className="card-body p-4">
                  <div className="mb-2">
                    <small className="text-muted fw-semibold">Propostas</small>
                  </div>
                  <h4 className="card-title mb-3" style={{ color: '#2d5a3d' }}>
                    As minhas Propostas
                  </h4>
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => navigate('/empresa/ver-propostas')}
                  >
                    Ver Minhas Propostas
                  </button>
                </div>
              </div>
            </div>

            {/* Card Ver todas */}
            <div className="col-md-6 mb-3">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f0f8ff' }}>
                <div className="card-body p-4">
                  <div className="mb-2">
                    <small className="text-muted fw-semibold">Propostas</small>
                  </div>
                  <h4 className="card-title mb-3" style={{ color: '#1e4a72' }}>
                    Ver todas
                  </h4>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => navigate('/empresa/todas-propostas')}
                  >
                    Explorar Propostas
                  </button>
                </div>
              </div>
            </div>

            {/* Card Perfil */}
            <div className="col-md-6 mb-3">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#fff8e1' }}>
                <div className="card-body p-4">
                  <div className="mb-2">
                    <small className="text-muted fw-semibold">Perfil</small>
                  </div>
                  <h4 className="card-title mb-3" style={{ color: '#8d6e63' }}>
                    Meu Perfil
                  </h4>
                  <button 
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => navigate(`/perfil-empresa/${userId}`)}
                  >
                    Ir para o Perfil
                  </button>
                </div>
              </div>
            </div>

           
          </div>

          
        </div>
    </div>
   </div>
  );
};

export default CompanyDashboard;