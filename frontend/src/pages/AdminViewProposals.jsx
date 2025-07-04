import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';

const AdminViewProposals = () => {
    const navigate = useNavigate();
    const [propostas, setPropostas] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assignments, setAssignments] = useState({});

    useEffect(() => {
        // Verificar se é admin
        const role = getUserRoleFromToken();
        if (role !== 'administrador') {
            navigate('/login');
            return;
        }

        const id = getUserIdFromToken();
        if (!id) {
            navigate('/login');
            return;
        }

        fetchEmpresas();
        fetchPropostas();
    }, [navigate]);

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

    const fetchPropostas = async (empresaId = '') => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('authToken');
            const url = empresaId
                ? `http://localhost:3000/proposals/empresa/${empresaId}`
                : `http://localhost:3000/proposals/proposals`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const proposalsData = response.data.data || [];
            setPropostas(proposalsData);

            // Buscar atribuições para cada proposta
            const assignmentsData = {};
            for (const proposta of proposalsData) {
                try {
                    const assignRes = await axios.get(`http://localhost:3000/proposals/proposals/${proposta.id}/assignments`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    assignmentsData[proposta.id] = assignRes.data.data || [];
                } catch (err) {
                    assignmentsData[proposta.id] = [];
                }
            }
            setAssignments(assignmentsData);

        } catch (err) {
            console.error('Erro ao carregar propostas:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('authToken');
                navigate('/login');
            } else {
                setError('Erro ao carregar propostas.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'pendente':
                return <span className="badge bg-warning text-dark">Pendente</span>;
            case 'ativa':
                return <span className="badge bg-success">Ativa</span>;
            case 'inativa':
                return <span className="badge bg-secondary">Inativa</span>;
            case 'rejeitada':
                return <span className="badge bg-danger">Rejeitada</span>;
            default:
                return <span className="badge bg-secondary">Desconhecido</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-PT');
    };

    const handleValidateProposal = async (proposalId) => {
        if (!window.confirm('Tem certeza que deseja validar esta proposta?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${proposalId}/validate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPropostas(prev => prev.map(p =>
                p.id === proposalId ? { ...p, estado: 'ativa' } : p
            ));
        } catch (err) {
            console.error('Erro ao validar proposta:', err);
            alert('Erro ao validar proposta');
        }
    };

    const handleRejectProposal = async (proposalId) => {
        if (!window.confirm('Tem certeza que deseja rejeitar esta proposta?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${proposalId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPropostas(prev => prev.map(p =>
                p.id === proposalId ? { ...p, estado: 'rejeitada' } : p
            ));
        } catch (err) {
            console.error('Erro ao rejeitar proposta:', err);
            alert('Erro ao rejeitar proposta');
        }
    };

    // ADICIONAR FUNÇÃO PARA INATIVAR PROPOSTA
    const handleInactivateProposal = async (proposalId) => {
        if (!window.confirm('Tem certeza que deseja inativar esta proposta?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${proposalId}/inactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPropostas(prev => prev.map(p =>
                p.id === proposalId ? { ...p, estado: 'inativa' } : p
            ));
        } catch (err) {
            console.error('Erro ao inativar proposta:', err);
            alert('Erro ao inativar proposta');
        }
    };

    // ADICIONAR FUNÇÃO PARA REATIVAR PROPOSTA
    const handleReactivateProposal = async (proposalId) => {
        if (!window.confirm('Tem certeza que deseja reativar esta proposta?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${proposalId}/reactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPropostas(prev => prev.map(p =>
                p.id === proposalId ? { ...p, estado: 'ativa' } : p
            ));
        } catch (err) {
            console.error('Erro ao reativar proposta:', err);
            alert('Erro ao reativar proposta');
        }
    };

    const handleRemoveProposal = async (proposalId) => {
        if (!window.confirm('Tem certeza que deseja remover esta proposta? Esta ação não pode ser desfeita.')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:3000/proposals/${proposalId}/remove`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPropostas(prev => prev.filter(p => p.id !== proposalId));
        } catch (err) {
            console.error('Erro ao remover proposta:', err);
            alert('Erro ao remover proposta');
        }
    };

    const handleFilterByEmpresa = (empresaId) => {
        setSelectedEmpresa(empresaId);
        fetchPropostas(empresaId);
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">A carregar...</span>
                    </div>
                    <p className="mt-2">A carregar propostas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Gestão de Propostas</h2>
                    <p className="text-muted mb-0">
                        {propostas.length} proposta(s) encontrada(s)
                    </p>
                </div>
                <div>
                    <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => navigate('/admin')}
                    >
                        Dashboard
                    </button>
                    <button className="btn btn-warning" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Filtros */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label">Filtrar por Empresa:</label>
                    <select
                        className="form-select"
                        value={selectedEmpresa}
                        onChange={(e) => handleFilterByEmpresa(e.target.value)}
                    >
                        <option value="">Todas as empresas</option>
                        {empresas.map(empresa => (
                            <option key={empresa.id} value={empresa.id}>
                                {empresa.nome_empresa}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Filtrar por Estado:</label>
                    <select
                        className="form-select"
                        value={selectedEstado}
                        onChange={(e) => setSelectedEstado(e.target.value)}
                    >
                        <option value="">Todos os estados</option>
                        <option value="pendente">Pendente</option>
                        <option value="ativa">Ativa</option>
                        <option value="inativa">Inativa</option>
                        <option value="rejeitada">Rejeitada</option>
                    </select>
                </div>
            </div>

            {propostas.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    <h5>Nenhuma Proposta Encontrada</h5>
                    <p>Não há propostas para mostrar com os filtros aplicados.</p>
                </div>
            ) : (
                <div className="row">
                    {propostas
                        .filter(p => !selectedEstado || p.estado === selectedEstado)
                        .map(proposta => (
                            <div key={proposta.id} className="col-12 mb-4">
                                <div className="card shadow-sm">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">{proposta.titulo}</h5>
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
                                                <h6 className="text-muted">Informações da Empresa</h6>
                                                <p><strong>Empresa:</strong> {proposta.company_profile?.nome_empresa || 'N/A'}</p>

                                                <h6 className="text-muted">Informações do Criador</h6>
                                                <p><strong>Criado por:</strong> {proposta.criador?.nome || 'N/A'}</p>

                                                {/* Acesso correto ao departamento */}
                                                {proposta.criador?.department_profile?.departamento ? (
                                                    <p><strong>Departamento:</strong> {proposta.criador.department_profile.departamento}</p>
                                                ) : (
                                                    <p><strong>Tipo de Criador:</strong> {proposta.criador?.tipo_utilizador || 'N/A'}</p>
                                                )}

                                                <p><strong>Email:</strong> {proposta.criador?.email_institucional || 'N/A'}</p>
                                                <p><strong>Tipo:</strong> {proposta.tipo_proposta}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <h6 className="text-muted">Descrição</h6>
                                            <p className="mb-2">{proposta.descricao}</p>
                                        </div>

                                        <div className="row mt-3">
                                            <div className="col-md-6">
                                                <h6 className="text-muted">Perfil do Candidato</h6>
                                                <p className="mb-2">{proposta.perfil_candidato}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <h6 className="text-muted">Contacto</h6>
                                                <p className="mb-2">{proposta.contacto_nome} ({proposta.contacto_email})</p>
                                            </div>
                                        </div>

                                        {proposta.competencias_tecnicas && (
                                            <div className="mt-3">
                                                <h6 className="text-muted">Competências Técnicas</h6>
                                                <p className="bg-light p-2 rounded">{proposta.competencias_tecnicas}</p>
                                            </div>
                                        )}

                                        {proposta.soft_skills && (
                                            <div className="mt-3">
                                                <h6 className="text-muted">Soft Skills</h6>
                                                <p className="bg-light p-2 rounded">{proposta.soft_skills}</p>
                                            </div>
                                        )}

                                        {/* Seção de Estudantes Atribuídos */}
                                        {assignments[proposta.id] && assignments[proposta.id].length > 0 && (
                                            <div className="alert alert-info mt-3">
                                                <h6 className="mb-2">
                                                    <i className="bi bi-person-check"></i> Estudantes Atribuídos:
                                                </h6>
                                                {assignments[proposta.id].map((assignment, index) => (
                                                    <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                                                        <span>
                                                            <strong>{assignment.student_profile?.user?.nome}</strong>
                                                            {assignment.student_profile?.curso && ` - ${assignment.student_profile.curso}`}
                                                            {assignment.student_profile?.user?.email_institucional && (
                                                                <small className="text-muted d-block">
                                                                    {assignment.student_profile.user.email_institucional}
                                                                </small>
                                                            )}
                                                        </span>
                                                        <div className="d-flex flex-column align-items-end">
                                                            <span className={`badge ${assignment.estado === 'pendente' ? 'bg-warning text-dark' :
                                                                assignment.estado === 'aceite' ? 'bg-success' :
                                                                    'bg-danger'
                                                                }`}>
                                                                {assignment.estado}
                                                            </span>

                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* BOTÕES DE AÇÃO CORRIGIDOS */}
                                        <div className="d-flex gap-2 mt-3">
                                            {/* Botões para propostas pendentes */}
                                            {proposta.estado === 'pendente' && (
                                                <>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleValidateProposal(proposta.id)}
                                                    >
                                                        <i className="bi bi-check-circle"></i> Validar
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRejectProposal(proposta.id)}
                                                    >
                                                        <i className="bi bi-x-circle"></i> Rejeitar
                                                    </button>
                                                </>
                                            )}

                                            {/* Botões para propostas ativas */}
                                            {proposta.estado === 'ativa' && (
                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() => handleInactivateProposal(proposta.id)}
                                                >
                                                    <i className="bi bi-pause-circle"></i> Inativar
                                                </button>
                                            )}

                                            {/* Botões para propostas inativas */}
                                            {proposta.estado === 'inativa' && (
                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() => handleReactivateProposal(proposta.id)}
                                                >
                                                    <i className="bi bi-play-circle"></i> Reativar
                                                </button>
                                            )}

                                            {/* Botão remover (sempre disponível) */}
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleRemoveProposal(proposta.id)}
                                            >
                                                <i className="bi bi-trash"></i> Remover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default AdminViewProposals;