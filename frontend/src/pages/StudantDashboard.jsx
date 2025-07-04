import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar';
import axios from 'axios';

const PaginaEstudante = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [propostas, setPropostas] = useState([]);

  useEffect(() => {
    // Verificar se é estudante
    const role = getUserRoleFromToken();
    if (role !== 'estudante') {
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
    fetchRecentProposals();
  }, [navigate]);

  const fetchUserData = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:3000/users/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
    }
  };

  const fetchRecentProposals = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:3000/proposals/proposals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Pegar apenas as 5 propostas mais recentes que estão ativas
      const activeProposals = response.data.data
        ?.filter(p => p.estado === 'ativa')
        ?.slice(0, 5) || [];
      
      setPropostas(activeProposals);
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
    if (!name) return 'EU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
                <h5 className="mb-0">{userData?.nome || 'Estudante'}</h5>
                <small className="text-muted">Aluno</small>
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
                    onClick={() => navigate('/estudante/propostas')}
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
                    onClick={() => navigate('/estudante/todas-propostas')}
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
                    Editar Perfil
                  </h4>
                  <button 
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => navigate(`/perfil-estudante/${userId}`)}
                  >
                    Ir para o Perfil
                  </button>
                </div>
              </div>
            </div>

            {/* Card estatística */}
            <div className="col-md-6 mb-3">
              <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f3e5f5' }}>
                <div className="card-body p-4 position-relative">
                  <div className="mb-2">
                    <small className="text-muted fw-semibold">Propostas</small>
                  </div>
                  <h4 className="card-title mb-3" style={{ color: '#6a1b9a' }}>
                    Tem {propostas.length} Propostas
                  </h4>
                  <div 
                    className="position-absolute"
                    style={{ top: '10px', right: '15px', fontSize: '24px' }}
                  >
                    ⭐
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Novas Propostas */}
          <div className="bg-white rounded shadow-sm">
            <div 
              className="px-4 py-3 text-white rounded-top"
              style={{ backgroundColor: '#2d5a3d' }}
            >
              <h5 className="mb-0">Novas Propostas</h5>
            </div>

            <div className="p-0">
              {propostas.length === 0 ? (
                <div className="text-center p-5">
                  <div className="text-muted">
                    <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                    <h6 className="mt-3">Nenhuma proposta disponível</h6>
                    <p className="mb-0">Novas propostas aparecerão aqui quando estiverem disponíveis.</p>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                      <tr>
                        <th className="px-4 py-3 fw-semibold">Data</th>
                        <th className="px-4 py-3 fw-semibold">Empresa</th>
                        <th className="px-4 py-3 fw-semibold">Detalhes adicionais</th>
                        <th className="px-4 py-3 fw-semibold">Tipo de Proposta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propostas.map((proposta, index) => (
                        <tr key={proposta.id} className={index % 2 === 0 ? '' : 'bg-light'}>
                          <td className="px-4 py-3">
                            {formatDate(proposta.data_submissao)}
                          </td>
                          <td className="px-4 py-3">
                            <strong>{proposta.company_profile?.nome_empresa || 'N/A'}</strong>
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-medium">{proposta.titulo}</span>
                            <br />
                            <small className="text-muted">
                              {proposta.local_trabalho || 'Local não especificado'}
                            </small>
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge bg-info text-dark px-2 py-1">
                              {proposta.tipo_proposta}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {propostas.length > 0 && (
                <div className="text-center p-3 border-top">
                  <button 
                    className="btn btn-link text-decoration-none"
                    onClick={() => navigate('/estudante/todas-propostas')}
                    style={{ color: '#2d5a3d' }}
                  >
                    Ver tudo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaEstudante;