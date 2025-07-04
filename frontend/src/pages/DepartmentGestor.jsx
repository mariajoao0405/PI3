import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar'

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
        <div className="d-flex">
         <Sidebar />
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

               
            </div>
        </div>
    );
};

export default GestorDashboard;