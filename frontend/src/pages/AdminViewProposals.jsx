import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUserRoleFromToken } from '../componentes/jwtdecode';

const AdminViewProposals = () => {
    const navigate = useNavigate();
    const [propostas, setPropostas] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const role = getUserRoleFromToken();
        if (role !== 'administrador') {
            navigate('/login');
            return;
        }

        const token = localStorage.getItem('authToken');

        const fetchEmpresas = async () => {
            try {
                const res = await axios.get('http://localhost:3000/companies/companies', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEmpresas(res.data.data || []);
            } catch (err) {
                console.error('Erro ao carregar empresas:', err);
                setError('Erro ao carregar lista de empresas.');
            }
        };

        fetchEmpresas();
        fetchPropostas();
    }, [navigate]);

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

            setPropostas(response.data.data || []);
        } catch (err) {
            console.error('Erro ao carregar propostas:', err);
            setError('Erro ao carregar propostas.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmpresaChange = (e) => {
        const empresaId = e.target.value;
        setSelectedEmpresa(empresaId);

        if (empresaId) {
            fetchPropostas(parseInt(empresaId));
        } else {
            fetchPropostas();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const handleAprovarProposta = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${id}/validate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropostas(prev => prev.map(p => p.id === id ? { ...p, estado: 'ativa' } : p));
        } catch (err) {
            console.error('Erro ao aprovar proposta:', err);
            alert('Erro ao aprovar proposta');
        }
    };

    const handleRejeitarProposta = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${id}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropostas(prev => prev.map(p => p.id === id ? { ...p, estado: 'removida' } : p));
        } catch (err) {
            console.error('Erro ao rejeitar proposta:', err);
            alert('Erro ao rejeitar proposta');
        }
    };

    const handleDesativarProposta = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${id}/inactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropostas(prev => prev.map(p => p.id === id ? { ...p, estado: 'inativa' } : p));
        } catch (err) {
            console.error('Erro ao desativar proposta:', err);
            alert('Erro ao desativar proposta');
        }
    };

    const handleAtivarProposta = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(`http://localhost:3000/proposals/${id}/reactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropostas(prev => prev.map(p => p.id === id ? { ...p, estado: 'ativa' } : p));
        } catch (err) {
            console.error('Erro ao ativar proposta:', err);
            alert('Erro ao ativar proposta');
        }
    };

    const handleEliminarProposta = async (id) => {
        if (!window.confirm('Tem a certeza que quer eliminar esta proposta permanentemente?')) return;
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:3000/proposals/${id}/remove`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropostas(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Erro ao eliminar proposta:', err);
            alert('Erro ao eliminar proposta');
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'pendente': return <span className="badge bg-warning text-dark">Pendente</span>;
            case 'ativa': return <span className="badge bg-success">Ativa</span>;
            case 'inativa': return <span className="badge bg-secondary">Inativa</span>;
            case 'removida': return <span className="badge bg-danger">Removida</span>;
            default: return <span className="badge bg-dark">Desconhecido</span>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-PT');
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestão de Propostas</h2>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/admin')}>
                        Voltar ao Dashboard
                    </button>
                    <button className="btn btn-warning" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="form-label fw-semibold">Filtrar por Empresa:</label>
                <select className="form-select" value={selectedEmpresa} onChange={handleEmpresaChange}>
                    <option value="">Todas as Empresas</option>
                    {empresas.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.nome_empresa}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="form-label fw-semibold">Filtrar por Estado:</label>
                <select
                    className="form-select"
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                >
                    <option value="">Todos os Estados</option>
                    <option value="pendente">Pendente</option>
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                    <option value="removida">Removida</option>
                </select>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border" role="status" />
                    <p className="mt-2">A carregar propostas...</p>
                </div>
            ) : propostas.length === 0 ? (
                <div className="alert alert-info">Nenhuma proposta encontrada.</div>
            ) : (
                <div className="row">
                    {propostas
                        .filter(p => !selectedEstado || p.estado === selectedEstado)
                        .map(proposta => (
                            <div key={proposta.id} className="col-12 mb-4">
                                <div className="card shadow-sm">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">{proposta.titulo}</h5>
                                        {getStatusBadge(proposta.estado)}
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Empresa:</strong> {proposta.company_profile?.nome_empresa || 'N/A'}</p>
                                                <p><strong>Tipo:</strong> {proposta.tipo_proposta}</p>
                                                <p><strong>Local:</strong> {proposta.local_trabalho}</p>
                                                <p><strong>Contrato:</strong> {proposta.tipo_contrato}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Criado por:</strong> {proposta.criador?.nome || 'N/A'}</p>
                                                <p><strong>Email:</strong> {proposta.criador?.email_institucional || 'N/A'}</p>
                                                <p><strong>Submissão:</strong> {formatDate(proposta.data_submissao)}</p>
                                                <p><strong>Prazo:</strong> {formatDate(proposta.prazo_candidatura)}</p>
                                            </div>
                                        </div>

                                        <hr />
                                        <p><strong>Descrição:</strong> {proposta.descricao}</p>
                                        <p><strong>Perfil:</strong> {proposta.perfil_candidato}</p>
                                        <p><strong>Competências Técnicas:</strong> {proposta.competencias_tecnicas}</p>
                                        <p><strong>Soft Skills:</strong> {proposta.soft_skills}</p>
                                        <p><strong>Contacto:</strong> {proposta.contacto_nome} ({proposta.contacto_email})</p>

                                        {proposta.estado === 'pendente' && (
                                            <>
                                                <button className="btn btn-success btn-sm me-2" onClick={() => handleAprovarProposta(proposta.id)}>
                                                    Aprovar
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleRejeitarProposta(proposta.id)}>
                                                    Rejeitar
                                                </button>
                                            </>
                                        )}

                                        {proposta.estado === 'ativa' && (
                                            <button className="btn btn-warning btn-sm" onClick={() => handleDesativarProposta(proposta.id)}>
                                                Desativar
                                            </button>
                                        )}

                                        {proposta.estado === 'inativa' && (
                                            <>
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleAtivarProposta(proposta.id)}>
                                                    Ativar
                                                </button>
                                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleEliminarProposta(proposta.id)}>
                                                    Eliminar
                                                </button>
                                            </>
                                        )}

                                        {proposta.estado === 'removida' && (
                                            <div className="mt-3">
                                                <button className="btn btn-primary btn-sm me-2" onClick={() => handleAtivarProposta(proposta.id)}>
                                                    Reativar
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => handleEliminarProposta(proposta.id)}
                                                >
                                                    Eliminar
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
