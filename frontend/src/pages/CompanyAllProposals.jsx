import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar';
import axios from 'axios';

const CompanyAllProposals = () => {
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [companyProfile, setCompanyProfile] = useState(null);
  const [userId, setUserId] = useState(null);

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
    fetchData(id);
  }, [navigate]);

  const fetchData = async (id) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      
      // Buscar perfil da empresa primeiro
      const profileRes = await axios.get(`http://localhost:3000/companies/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const profile = Array.isArray(profileRes.data?.data) ? profileRes.data.data[0] : profileRes.data?.data;
      setCompanyProfile(profile);

      // Buscar todas as propostas
      const response = await axios.get('http://localhost:3000/proposals/proposals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allProposals = response.data.data || [];
      
      // Filtrar propostas:
      // 1. Excluir propostas da própria empresa
      // 2. Mostrar apenas propostas ativas
      const filteredProposals = allProposals.filter(proposta => {
        // Se a empresa não tem perfil, mostrar todas as propostas ativas
        if (!profile) {
          return proposta.estado === 'ativa';
        }
        
        // Excluir propostas da própria empresa e mostrar apenas ativas
        return proposta.empresa_id !== profile.id && proposta.estado === 'ativa';
      });

      setPropostas(filteredProposals);
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError('Erro ao carregar propostas. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'ativa':
        return <span className="badge bg-success">Ativa</span>;
      case 'pendente':
        return <span className="badge bg-warning text-dark">Pendente</span>;
      case 'inativa':
        return <span className="badge bg-secondary">Inativa</span>;
      default:
        return <span className="badge bg-secondary">Desconhecido</span>;
    }
  };

  const getPropostasFiltradas = () => {
    return propostas.filter(proposta => {
      const matchTipo = !filtroTipo || proposta.tipo_proposta === filtroTipo;
      const matchEstado = !filtroEstado || proposta.estado === filtroEstado;
      return matchTipo && matchEstado;
    });
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <div className="container mt-5">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">A carregar...</span>
              </div>
              <p className="mt-2">A carregar propostas...</p>
            </div>
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
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-0">Todas as Propostas</h2>
              <p className="text-muted mb-0">
                {getPropostasFiltradas().length} proposta(s) de outras empresas disponível(is)
              </p>
              {companyProfile && (
                <small className="text-muted">
                  Propostas da sua empresa ({companyProfile.nome_empresa}) não aparecem aqui
                </small>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded shadow-sm mb-4 p-3">
            <h6 className="mb-3">Filtrar Propostas</h6>
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">Tipo de Proposta:</label>
                <select
                  className="form-select"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="emprego">Emprego</option>
                  <option value="estágio">Estágio</option>
                  <option value="outra">Outra</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Estado:</label>
                <select
                  className="form-select"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos os estados</option>
                  <option value="ativa">Ativa</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Propostas */}
          {!companyProfile ? (
            <div className="alert alert-warning" role="alert">
              <h5>Perfil da Empresa Não Encontrado</h5>
              <p>Você precisa completar o perfil da sua empresa para visualizar propostas de outras empresas.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/perfil-empresa/${userId}`)}
              >
                Completar Perfil
              </button>
            </div>
          ) : getPropostasFiltradas().length === 0 ? (
            <div className="bg-white rounded shadow-sm p-5">
              <div className="text-center text-muted">
                <i className="bi bi-search" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Nenhuma proposta encontrada</h5>
                <p className="mb-0">
                  {propostas.length === 0
                    ? 'Não há propostas de outras empresas disponíveis no momento.'
                    : 'Tente ajustar os filtros para encontrar propostas.'}
                </p>
                <div className="mt-3">
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => navigate('/empresa/ver-propostas')}
                  >
                    Ver Minhas Propostas
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/empresa/criar-proposta')}
                  >
                    Criar Nova Proposta
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {getPropostasFiltradas().map((proposta) => (
                <div key={proposta.id} className="col-12 mb-4">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">{proposta.titulo}</h5>
                        <small className="text-muted">
                          <i className="bi bi-building"></i> {proposta.company_profile?.nome_empresa || 'N/A'}
                        </small>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {getStatusBadge(proposta.estado)}
                        <span className="badge bg-info text-dark">
                          {proposta.tipo_proposta}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-info-circle"></i> Informações Gerais
                          </h6>
                          <p className="mb-2">
                            <strong>Local:</strong> {proposta.local_trabalho || 'N/A'}
                          </p>
                          <p className="mb-2">
                            <strong>Contrato:</strong> {proposta.tipo_contrato || 'N/A'}
                          </p>
                          <p className="mb-2">
                            <strong>Data de Submissão:</strong> {formatDate(proposta.data_submissao)}
                          </p>
                          <p className="mb-2">
                            <strong>Prazo para Candidatura:</strong> {formatDate(proposta.prazo_candidatura)}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-person-badge"></i> Contacto
                          </h6>
                          <p className="mb-2">
                            <strong>Nome:</strong> {proposta.contacto_nome || 'N/A'}
                          </p>
                          <p className="mb-2">
                            <strong>Email:</strong> {proposta.contacto_email || 'N/A'}
                          </p>
                          <p className="mb-2">
                            <strong>Criado por:</strong> {proposta.criador?.nome || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <h6 className="text-muted mb-2">
                          <i className="bi bi-file-text"></i> Descrição
                        </h6>
                        <p className="mb-3">{proposta.descricao}</p>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-person-check"></i> Perfil do Candidato
                          </h6>
                          <p className="mb-3">{proposta.perfil_candidato || 'N/A'}</p>
                        </div>
                        <div className="col-md-6">
                          {proposta.competencias_tecnicas && (
                            <>
                              <h6 className="text-muted mb-2">
                                <i className="bi bi-gear"></i> Competências Técnicas
                              </h6>
                              <div className="bg-light p-2 rounded mb-3">
                                {proposta.competencias_tecnicas}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {proposta.soft_skills && (
                        <div className="mt-2">
                          <h6 className="text-muted mb-2">
                            <i className="bi bi-lightbulb"></i> Soft Skills
                          </h6>
                          <div className="bg-light p-2 rounded">
                            {proposta.soft_skills}
                          </div>
                        </div>
                      )}

                      {/* Área de informação */}
                      <div className="mt-3 p-3 bg-light rounded">
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-info-circle text-primary me-2"></i>
                          <span className="text-muted">
                            Esta é uma visualização de propostas de outras empresas. Para ver/editar suas propostas, acesse "Ver as minhas Propostas".
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyAllProposals;