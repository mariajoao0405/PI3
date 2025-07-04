import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar'

const StudantProposals = () => {
    const navigate = useNavigate();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
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

        const fetchProposals = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/students/my-proposals', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProposals(response.data.data || []);
            } catch (err) {
                console.error('Erro ao carregar propostas:', err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                } else {
                    setError('Erro ao carregar suas propostas.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, [navigate]);

 
    const getProposalStatusBadge = (estado) => {
        switch (estado) {
            case 'pendente':
                return <span className="badge bg-warning text-dark">Pendente Validação</span>;
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
        <div className="d-flex">
         <Sidebar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2>Minhas Propostas</h2>
                        <p className="text-muted mb-0">
                            {proposals.length} proposta(s) atribuída(s) a você
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {proposals.length === 0 ? (
                    <div className="alert alert-info" role="alert">
                        <h5>Nenhuma Proposta Encontrada</h5>
                        <p>Você ainda não tem propostas atribuídas pelas empresas.</p>
                    </div>
                ) : (
                    <div className="row">
                        {proposals.map((match) => (
                            <div key={match.id} className="col-12 mb-4">
                                <div className="card shadow-sm">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">{match.proposal?.titulo}</h5>
                                        <div className="d-flex align-items-center gap-2">
                                        
                                            {getProposalStatusBadge(match.proposal?.estado)}
                                            <span className="badge bg-info text-dark">
                                                {match.proposal?.tipo_proposta}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <h6 className="text-muted mb-1">
                                                    <i className="bi bi-building"></i> Empresa
                                                </h6>
                                                <p className="mb-3"><strong>{match.proposal?.company_profile?.nome_empresa}</strong></p>
                                                
                                                <h6 className="text-muted mb-1">
                                                    <i className="bi bi-file-text"></i> Descrição
                                                </h6>
                                                <p className="mb-3">{match.proposal?.descricao || 'Sem descrição'}</p>
                                                
                                                <h6 className="text-muted mb-1">
                                                    <i className="bi bi-briefcase"></i> Detalhes da Vaga
                                                </h6>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <p className="mb-1"><strong>Local:</strong> {match.proposal?.local_trabalho || 'N/A'}</p>
                                                        <p className="mb-1"><strong>Tipo de Contrato:</strong> {match.proposal?.tipo_contrato || 'N/A'}</p>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <p className="mb-1"><strong>Prazo Candidatura:</strong> {formatDate(match.proposal?.prazo_candidatura)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="bg-light p-3 rounded">
                                                
                                                    <h6 className="text-muted mb-2 mt-3">
                                                        <i className="bi bi-person-lines-fill"></i> Contacto
                                                    </h6>
                                                    <p className="mb-1"><strong>Nome:</strong> {match.proposal?.contacto_nome || 'N/A'}</p>
                                                    <p className="mb-1"><strong>Email:</strong> {match.proposal?.contacto_email || 'N/A'}</p>
                                                    
                                                    {match.proposal?.company_profile?.website && (
                                                        <p className="mb-1">
                                                            <strong>Website:</strong><br />
                                                            <a href={match.proposal.company_profile.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                                {match.proposal.company_profile.website}
                                                            </a>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {match.proposal?.competencias_tecnicas && (
                                            <div className="mt-3">
                                                <h6 className="text-muted mb-1">
                                                    <i className="bi bi-code-slash"></i> Competências Técnicas
                                                </h6>
                                                <p className="bg-light p-2 rounded">{match.proposal.competencias_tecnicas}</p>
                                            </div>
                                        )}

                                        {match.proposal?.soft_skills && (
                                            <div className="mt-3">
                                                <h6 className="text-muted mb-1">
                                                    <i className="bi bi-people"></i> Soft Skills
                                                </h6>
                                                <p className="bg-light p-2 rounded">{match.proposal.soft_skills}</p>
                                            </div>
                                        )}

                                        {match.observacoes && (
                                            <div className="mt-3">
                                                <h6 className="text-muted mb-1">
                                                    <i className="bi bi-chat-left-text"></i> Observações da Empresa
                                                </h6>
                                                <div className="alert alert-info">
                                                    {match.observacoes}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 pt-2 border-top">
                                            <div className="d-flex justify-content-between align-items-center">
                                                
                                                <span className="text-muted">
                                                    <strong>Status da Proposta:</strong> {getProposalStatusBadge(match.proposal?.estado)}
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
    );
};

export default StudantProposals;
