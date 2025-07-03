import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';

const GestorDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [departmentProfile, setDepartmentProfile] = useState(null);
    
    // Estados para propostas
    const [propostas, setPropostas] = useState([]);
    const [propostasFiltered, setPropostasFiltered] = useState([]);
    const [proposalFilter, setProposalFilter] = useState('');
    const [proposalStatusFilter, setProposalStatusFilter] = useState('');
    
    // Estados para estudantes
    const [estudantes, setEstudantes] = useState([]);
    const [estudantesFiltered, setEstudantesFiltered] = useState([]);
    const [studentFilter, setStudentFilter] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    
    // Estados para empresas
    const [empresas, setEmpresas] = useState([]);
    const [assignments, setAssignments] = useState({});
    
    // Tab ativo
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Verificar se é gestor
        const role = getUserRoleFromToken();
        if (role !== 'gestor') {
            navigate('/login');
            return;
        }

        const id = getUserIdFromToken();
        if (!id) {
            navigate('/login');
            return;
        }
        setUserId(id);

        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
         
            // Buscar propostas
            const proposalsRes = await axios.get('http://localhost:3000/proposals/proposals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropostas(proposalsRes.data.data || []);
            setPropostasFiltered(proposalsRes.data.data || []);

            // Buscar estudantes
            const studentsRes = await axios.get('http://localhost:3000/students/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstudantes(studentsRes.data.data || []);
            setEstudantesFiltered(studentsRes.data.data || []);

            // Buscar empresas
            const companiesRes = await axios.get('http://localhost:3000/companies/companies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmpresas(companiesRes.data.data || []);

            // Buscar atribuições
            const assignmentsData = {};
            for (const proposta of proposalsRes.data.data || []) {
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
            console.error('Erro ao carregar dados:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('authToken');
                navigate('/login');
            } else {
                setError('Erro ao carregar dados do dashboard.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Filtros para propostas
    useEffect(() => {
        let filtered = propostas;

        if (proposalFilter) {
            filtered = filtered.filter(p => 
                p.titulo.toLowerCase().includes(proposalFilter.toLowerCase()) ||
                p.company_profile?.nome_empresa?.toLowerCase().includes(proposalFilter.toLowerCase())
            );
        }

        if (proposalStatusFilter) {
            filtered = filtered.filter(p => p.estado === proposalStatusFilter);
        }

        setPropostasFiltered(filtered);
    }, [proposalFilter, proposalStatusFilter, propostas]);

    // Filtros para estudantes
    useEffect(() => {
        let filtered = estudantes;

        if (studentFilter) {
            filtered = filtered.filter(e => 
                e.user?.nome?.toLowerCase().includes(studentFilter.toLowerCase()) ||
                e.user?.email_institucional?.toLowerCase().includes(studentFilter.toLowerCase())
            );
        }

        if (courseFilter) {
            filtered = filtered.filter(e => 
                e.curso?.toLowerCase().includes(courseFilter.toLowerCase())
            );
        }

        setEstudantesFiltered(filtered);
    }, [studentFilter, courseFilter, estudantes]);

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

    // Estatísticas
    const stats = {
        totalPropostas: propostas.length,
        propostasAtivas: propostas.filter(p => p.estado === 'ativa').length,
        propostasPendentes: propostas.filter(p => p.estado === 'pendente').length,
        totalEstudantes: estudantes.length,
        totalEmpresas: empresas.length,
        totalAtribuicoes: Object.values(assignments).reduce((acc, curr) => acc + curr.length, 0)
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">A carregar...</span>
                    </div>
                    <p className="mt-2">A carregar dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Dashboard do Gestor</h2>
                    {departmentProfile && (
                        <p className="text-muted mb-0">
                            <strong>Departamento:</strong> {departmentProfile.departamento}
                        </p>
                    )}
                </div>
                <div>
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => navigate('/gestor/criar-proposta')}
                    >
                        Nova Proposta
                    </button>
                    <button
                        className="btn btn-outline-primary me-2"
                        onClick={() => navigate('/gestor/ver-propostas')}
                    >
                        Ver Propostas
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

            {/* Cards de Estatísticas */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="card-title">Propostas Totais</h5>
                                    <h3 className="mb-0">{stats.totalPropostas}</h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-file-earmark-text fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="card-title">Propostas Ativas</h5>
                                    <h3 className="mb-0">{stats.propostasAtivas}</h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-check-circle fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-warning text-dark">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="card-title">Pendentes</h5>
                                    <h3 className="mb-0">{stats.propostasPendentes}</h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-clock fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="card-title">Estudantes</h5>
                                    <h3 className="mb-0">{stats.totalEstudantes}</h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-people fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-secondary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="card-title">Empresas</h5>
                                    <h3 className="mb-0">{stats.totalEmpresas}</h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-building fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="card-title">Atribuições</h5>
                                    <h3 className="mb-0">{stats.totalAtribuicoes}</h3>
                                </div>
                                <div className="align-self-center">
                                    <i className="bi bi-link-45deg fs-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'propostas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('propostas')}
                    >
                        Propostas ({propostasFiltered.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'estudantes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('estudantes')}
                    >
                        Estudantes ({estudantesFiltered.length})
                    </button>
                </li>
            </ul>

            {/* Conteúdo das Tabs */}
            {activeTab === 'overview' && (
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header">
                                <h5>Propostas Recentes</h5>
                            </div>
                            <div className="card-body">
                                {propostas.slice(0, 5).map(proposta => (
                                    <div key={proposta.id} className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong>{proposta.titulo}</strong>
                                            <br />
                                            <small className="text-muted">{proposta.company_profile?.nome_empresa}</small>
                                        </div>
                                        {getStatusBadge(proposta.estado)}
                                    </div>
                                ))}
                                <div className="text-center mt-3">
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => setActiveTab('propostas')}
                                    >
                                        Ver Todas
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header">
                                <h5>Estudantes Recentes</h5>
                            </div>
                            <div className="card-body">
                                {estudantes.slice(0, 5).map(estudante => (
                                    <div key={estudante.id} className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong>{estudante.user?.nome}</strong>
                                            <br />
                                            <small className="text-muted">{estudante.curso}</small>
                                        </div>
                                        <span className="badge bg-info">{estudante.ano_academico}º ano</span>
                                    </div>
                                ))}
                                <div className="text-center mt-3">
                                    <button 
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => setActiveTab('estudantes')}
                                    >
                                        Ver Todos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'propostas' && (
                <div>
                    {/* Filtros de Propostas */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por título ou empresa..."
                                value={proposalFilter}
                                onChange={(e) => setProposalFilter(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <select
                                className="form-select"
                                value={proposalStatusFilter}
                                onChange={(e) => setProposalStatusFilter(e.target.value)}
                            >
                                <option value="">Todos os estados</option>
                                <option value="pendente">Pendente</option>
                                <option value="ativa">Ativa</option>
                                <option value="inativa">Inativa</option>
                                <option value="rejeitada">Rejeitada</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de Propostas */}
                    <div className="row">
                        {propostasFiltered.map(proposta => (
                            <div key={proposta.id} className="col-12 mb-3">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="card-title">{proposta.titulo}</h5>
                                                <p className="card-text">
                                                    <strong>Empresa:</strong> {proposta.company_profile?.nome_empresa}<br />
                                                    <strong>Tipo:</strong> {proposta.tipo_proposta}<br />
                                                    <strong>Local:</strong> {proposta.local_trabalho}<br />
                                                    <strong>Prazo:</strong> {formatDate(proposta.prazo_candidatura)}
                                                </p>
                                                {assignments[proposta.id] && assignments[proposta.id].length > 0 && (
                                                    <div className="mt-2">
                                                        <small className="text-muted">
                                                            <i className="bi bi-person-check"></i> {assignments[proposta.id].length} estudante(s) atribuído(s)
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                {getStatusBadge(proposta.estado)}
                                                <br />
                                                <small className="text-muted">
                                                    {formatDate(proposta.data_submissao)}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'estudantes' && (
                <div>
                    {/* Filtros de Estudantes */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por nome ou email..."
                                value={studentFilter}
                                onChange={(e) => setStudentFilter(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por curso..."
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Lista de Estudantes */}
                    <div className="row">
                        {estudantesFiltered.map(estudante => (
                            <div key={estudante.id} className="col-md-6 mb-3">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h5 className="card-title">{estudante.user?.nome}</h5>
                                                <p className="card-text">
                                                    <strong>Email:</strong> {estudante.user?.email_institucional}<br />
                                                    <strong>Curso:</strong> {estudante.curso}<br />
                                                    <strong>Ano:</strong> {estudante.ano_academico}º ano
                                                </p>
                                                {estudante.telefone && (
                                                    <p className="card-text">
                                                        <strong>Telefone:</strong> {estudante.telefone}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-info">{estudante.ano_academico}º ano</span>
                                                <br />
                                                <small className="text-muted">
                                                    {estudante.curso}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestorDashboard;