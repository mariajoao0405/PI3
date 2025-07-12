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
    const [userData, setUserData] = useState(null);
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
            
            // Buscar dados do usuário
            const userRes = await axios.get(`https://pi3-q1c2.onrender.com/users/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(userRes.data.data);

            // Buscar propostas
            const proposalsRes = await axios.get('https://pi3-q1c2.onrender.com/proposals/proposals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropostas(proposalsRes.data.data || []);
            setPropostasFiltered(proposalsRes.data.data || []);

            // Buscar estudantes
            const studentsRes = await axios.get('https://pi3-q1c2.onrender.com/students/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEstudantes(studentsRes.data.data || []);
            setEstudantesFiltered(studentsRes.data.data || []);

            // Buscar empresas
            const companiesRes = await axios.get('https://pi3-q1c2.onrender.com/companies/companies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmpresas(companiesRes.data.data || []);

            // Buscar atribuições
            const assignmentsData = {};
            for (const proposta of proposalsRes.data.data || []) {
                try {
                    const assignRes = await axios.get(`https://pi3-q1c2.onrender.com/proposals/proposals/${proposta.id}/assignments`, {
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

    const getInitials = (name) => {
        if (!name) return 'GS';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
            <div className="d-flex">
                <Sidebar />
                <div className="container mt-5">
                    <div className="text-center">
                        <div className="spinner-border" role="status">
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
                    <div className="d-flex justify-content-between align-items-center mb-4 bg-white rounded-3 p-4 shadow-sm">
                        <div className="d-flex align-items-center">
                            <div 
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                style={{ width: '50px', height: '50px', fontSize: '18px', fontWeight: 'bold' }}
                            >
                                {getInitials(userData?.nome)}
                            </div>
                            <div>
                                <h5 className="mb-0">{userData?.nome || 'Gestor'}</h5>
                                <small className="text-muted">Gestor</small>
                            </div>
                        </div>
                    </div>

                    {/* Cards de navegação */}
                    <div className="row mb-4">
                        {/* Card Lista de Propostas */}
                        <div className="col-md-6 mb-3">
                            <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#e8f5e8' }}>
                                <div className="card-body p-4">
                                    <div className="mb-2">
                                        <small className="text-muted fw-semibold">Propostas</small>
                                    </div>
                                    <h4 className="card-title mb-3" style={{ color: '#2d5a3d' }}>
                                        Lista de Propostas
                                    </h4>
                                    <button 
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => navigate('/gestor/ver-propostas')}
                                    >
                                        Ver Propostas
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Card Estudantes */}
                        <div className="col-md-6 mb-3">
                            <div className="card h-100 shadow-sm border-0" style={{ backgroundColor: '#f3e5f5' }}>
                                <div className="card-body p-4">
                                    <div className="mb-2">
                                        <small className="text-muted fw-semibold">Estudantes</small>
                                    </div>
                                    <h4 className="card-title mb-3" style={{ color: '#6a1b9a' }}>
                                        Gestão de Estudantes
                                    </h4>
                                    <button 
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => navigate('/gestor/estudantes')}
                                    >
                                        Ver Estudantes
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

export default GestorDashboard;