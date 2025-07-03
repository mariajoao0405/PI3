import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';

const CompanyViewProposal = () => {
    const navigate = useNavigate();
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [students, setStudents] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [assignments, setAssignments] = useState({});

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

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');

                // Buscar perfil da empresa
                const profileRes = await axios.get(`http://localhost:3000/companies/user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const profile = Array.isArray(profileRes.data?.data) ? profileRes.data.data[0] : profileRes.data?.data;
                setCompanyProfile(profile);

                if (profile?.id) {
                    // Buscar propostas da empresa
                    const proposalsRes = await axios.get(`http://localhost:3000/proposals/empresa/${profile.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const proposalsData = proposalsRes.data.data || [];
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
                }

                // Buscar estudantes
                const studentsRes = await axios.get('http://localhost:3000/students/students', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(studentsRes.data.data || []);

            } catch (err) {
                console.error('Erro ao carregar dados:', err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                } else {
                    setError('Erro ao carregar propostas da empresa.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    const getStatusBadge = (estado) => {
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

    const handleEditProposal = (proposalId) => {
        navigate(`/empresa/editar-proposta/${proposalId}`);
    };

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

    const handleReactivateProposal = async (proposalId) => {
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

    const handleOpenAssignModal = (proposta) => {
        setSelectedProposal(proposta);
        setSelectedStudent('');
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setSelectedProposal(null);
        setSelectedStudent('');
    };

    const handleAssignProposal = async () => {
        if (!selectedStudent) {
            alert('Por favor, selecione um estudante.');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post('http://localhost:3000/proposals/assign-to-student', {
                proposal_id: selectedProposal.id,
                student_id: parseInt(selectedStudent)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(response.data.message);
            handleCloseAssignModal();

            // Recarregar atribuições após atribuir
            const assignRes = await axios.get(`http://localhost:3000/proposals/proposals/${selectedProposal.id}/assignments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(prev => ({
                ...prev,
                [selectedProposal.id]: assignRes.data.data || []
            }));

        } catch (err) {
            console.error('Erro ao atribuir proposta:', err);
            alert(err.response?.data?.error || 'Erro ao atribuir proposta.');
        }
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
                    <h2>Minhas Propostas</h2>
                    {companyProfile && (
                        <p className="text-muted mb-0">
                            <strong>{companyProfile.nome_empresa}</strong> - {propostas.length} proposta(s)
                        </p>
                    )}
                </div>
                <div>
                    <button
                        className="btn btn-primary me-2"
                        onClick={() => navigate('/empresa/criar-proposta')}
                    >
                        Nova Proposta
                    </button>
                    <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => navigate('/empresa')}
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

            {!companyProfile ? (
                <div className="alert alert-warning" role="alert">
                    <h5>Perfil da Empresa Não Encontrado</h5>
                    <p>Você precisa completar o perfil da sua empresa antes de criar propostas.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/perfil-empresa/${userId}`)}
                    >
                        Completar Perfil
                    </button>
                </div>
            ) : propostas.length === 0 ? (
                <div className="alert alert-info" role="alert">
                    <h5>Nenhuma Proposta Encontrada</h5>
                    <p>Você ainda não criou nenhuma proposta de emprego ou estágio.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/empresa/criar-proposta')}
                    >
                        Criar Primeira Proposta
                    </button>
                </div>
            ) : (
                <div className="row">
                    {propostas.map((proposta) => (
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
                                            <h6 className="text-muted">Informações da Vaga</h6>
                                            <p><strong>Local:</strong> {proposta.local_trabalho || 'N/A'}</p>
                                            <p><strong>Tipo de Contrato:</strong> {proposta.tipo_contrato || 'N/A'}</p>
                                            <p><strong>Prazo Candidatura:</strong> {formatDate(proposta.prazo_candidatura)}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Datas</h6>
                                            <p><strong>Criada em:</strong> {formatDate(proposta.data_submissao)}</p>
                                            <p><strong>Contacto:</strong> {proposta.contacto_nome} ({proposta.contacto_email})</p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <h6 className="text-muted">Descrição</h6>
                                        <p className="mb-2">{proposta.descricao || 'Sem descrição'}</p>
                                    </div>

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
                                                    </span>
                                                    <span className={`badge ${
                                                        assignment.estado === 'pendente' ? 'bg-warning text-dark' :
                                                        assignment.estado === 'aceite' ? 'bg-success' :
                                                        'bg-danger'
                                                    }`}>
                                                        {assignment.estado}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 mt-3">
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => handleEditProposal(proposta.id)}
                                        >
                                            Editar
                                        </button>

                                        {proposta.estado === 'ativa' && (
                                            <>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleOpenAssignModal(proposta)}
                                                >
                                                    Atribuir a Estudante
                                                </button>
                                            </>
                                        )}
                                        

                                        {proposta.estado === 'pendente' && (
                                            <span className="badge bg-warning text-dark ms-2">
                                                Aguardando validação
                                            </span>
                                        )}

                                        {proposta.estado === 'rejeitada' && (
                                            <span className="badge bg-danger ms-2">
                                                Rejeitada pelo admin
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Atribuição */}
            {showAssignModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Atribuir Proposta a Estudante</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseAssignModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedProposal && (
                                    <div className="mb-3">
                                        <h6>Proposta:</h6>
                                        <p><strong>{selectedProposal.titulo}</strong></p>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label">Selecionar Estudante:</label>
                                    <select
                                        className="form-select"
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                    >
                                        <option value="">Escolha um estudante...</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.user?.nome} - {student.curso}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseAssignModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAssignProposal}
                                >
                                    Atribuir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyViewProposal;