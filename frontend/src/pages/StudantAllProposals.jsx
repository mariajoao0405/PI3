import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar';
import axios from 'axios';

const StudentProposals = () => {
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [empresas, setEmpresas] = useState([]);

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

    fetchPropostas();
    fetchEmpresas();
  }, [navigate]);

  const fetchPropostas = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:3000/proposals/proposals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filtrar apenas propostas ativas
      const activeProposals = response.data.data?.filter(p => p.estado === 'ativa') || [];
      setPropostas(activeProposals);
    } catch (err) {
      console.error('Erro ao carregar propostas:', err);
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

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:3000/companies/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmpresas(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
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
      const matchEmpresa = !filtroEmpresa || proposta.empresa_id === parseInt(filtroEmpresa);
      return matchTipo && matchEmpresa;
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
                {getPropostasFiltradas().length} proposta(s) disponível(is)
              </p>
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
                  <option value="estagio">Estágio</option>
                  <option value="projeto">Projeto</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Empresa:</label>
                <select
                  className="form-select"
                  value={filtroEmpresa}
                  onChange={(e) => setFiltroEmpresa(e.target.value)}
                >
                  <option value="">Todas as empresas</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome_empresa}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Propostas */}
          {getPropostasFiltradas().length === 0 ? (
            <div className="bg-white rounded shadow-sm p-5">
              <div className="text-center text-muted">
                <i className="bi bi-search" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3">Nenhuma proposta encontrada</h5>
                <p className="mb-0">
                  {propostas.length === 0
                    ? 'Não há propostas disponíveis no momento.'
                    : 'Tente ajustar os filtros para encontrar propostas.'}
                </p>
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
                          {proposta.criador?.department_profile?.departamento && (
                            <p className="mb-2">
                              <strong>Departamento:</strong> {proposta.criador.department_profile.departamento}
                            </p>
                          )}
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
                          <p className="mb-3">{proposta.perfil_candidato}</p>
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

                      {/* Área de informação (sem botões de ação) */}
                      <div className="mt-3 p-3 bg-light rounded">
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-info-circle text-primary me-2"></i>
                          <span className="text-muted">
                            Esta é uma visualização apenas. Para candidatar-se, contacte diretamente a empresa.
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

export default StudentProposals;