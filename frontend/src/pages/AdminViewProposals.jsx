import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserRoleFromToken } from '../componentes/jwtdecode';

const AdminViewProposals = () => {
    const navigate = useNavigate();
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Verificar se é administrador
        const role = getUserRoleFromToken();
        if (role !== 'administrador') {
            navigate('/login');
            return;
        }

        const fetchPropostas = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/proposals/proposals', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Propostas carregadas:', response.data);
                setPropostas(response.data.data || []);
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

        fetchPropostas();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleValidarProposta = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${id}/validate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Atualizar a lista
            setPropostas(propostas.map(p => 
                p.id === id ? { ...p, estado: 'validada' } : p
            ));
        } catch (err) {
            console.error('Erro ao validar proposta:', err);
            alert('Erro ao validar proposta');
        }
    };

    const handleRejeitarProposta = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Atualizar a lista
            setPropostas(propostas.map(p => 
                p.id === id ? { ...p, estado: 'rejeitada' } : p
            ));
        } catch (err) {
            console.error('Erro ao rejeitar proposta:', err);
            alert('Erro ao rejeitar proposta');
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'pendente':
                return <span className="badge bg-warning text-dark">Pendente</span>;
            case 'ativa':
                return <span className="badge bg-success">Ativa</span>;
            case 'inativa':
                return <span className="badge bg-danger">Inativa </span>
            case 'removida':
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
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestão de Propostas</h2>
                <div>
                    <button 
                        className="btn btn-outline-secondary me-2" 
                        onClick={() => navigate('/admin')}
                    >
                        Voltar ao Dashboard
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

            {propostas.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    Nenhuma proposta encontrada.
                </div>
            ) : (
                <div className="row">
                    {propostas.map((proposta) => (
                        <div key={proposta.id} className="col-12 mb-4">
                            <div className="card shadow-sm">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{proposta.titulo}</h5>
                                    {getStatusBadge(proposta.estado)}
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Informações Gerais</h6>
                                            <p><strong>Tipo:</strong> {proposta.tipo_proposta}</p>
                                            <p><strong>Local:</strong> {proposta.local_trabalho || 'N/A'}</p>
                                            <p><strong>Tipo de Contrato:</strong> {proposta.tipo_contrato || 'N/A'}</p>
                                            <p><strong>Prazo Candidatura:</strong> {formatDate(proposta.prazo_candidatura)}</p>
                                            <p><strong>Data Submissão:</strong> {formatDate(proposta.data_submissao)}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Criada por</h6>
                                            {proposta.criador ? (
                                                <div>
                                                    <p><strong>Nome:</strong> {proposta.criador.nome}</p>
                                                    <p><strong>Email:</strong> {proposta.criador.email_institucional}</p>
                                                </div>
                                            ) : (
                                                <p>Informações do criador não disponíveis</p>
                                            )}

                                            <h6 className="text-muted mt-3">Empresa</h6>
                                            {proposta.company_profile ? (
                                                <div>
                                                    <p><strong>Nome:</strong> {proposta.company_profile.nome_empresa}</p>
                                                    <p><strong>NIF:</strong> {proposta.company_profile.nif}</p>
                                                    <p><strong>Website:</strong> {proposta.company_profile.website || 'N/A'}</p>
                                                </div>
                                            ) : (
                                                <p>Informações da empresa não disponíveis</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row mt-3">
                                        <div className="col-12">
                                            <h6 className="text-muted">Descrição</h6>
                                            <p>{proposta.descricao || 'Sem descrição'}</p>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Perfil do Candidato</h6>
                                            <p>{proposta.perfil_candidato || 'Não especificado'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Competências Técnicas</h6>
                                            <p>{proposta.competencias_tecnicas || 'Não especificado'}</p>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Soft Skills</h6>
                                            <p>{proposta.soft_skills || 'Não especificado'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Contacto</h6>
                                            <p><strong>Nome:</strong> {proposta.contacto_nome || 'N/A'}</p>
                                            <p><strong>Email:</strong> {proposta.contacto_email || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {proposta.estado === 'pendente' && (
                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleValidarProposta(proposta.id)}
                                            >
                                                Validar Proposta
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleRejeitarProposta(proposta.id)}
                                            >
                                                Rejeitar Proposta
                                            </button>
                                        </div>
                                    )}
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