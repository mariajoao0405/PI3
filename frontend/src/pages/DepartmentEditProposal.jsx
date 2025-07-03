import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';

const DepartmentEditProposal = () => {
    const navigate = useNavigate();
    const { proposal_id } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para empresas
    const [empresas, setEmpresas] = useState([]);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);

    // Estados do formulário
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        tipo_proposta: '',
        local_trabalho: '',
        prazo_candidatura: '',
        tipo_contrato: '',
        perfil_candidato: '',
        competencias_tecnicas: '',
        soft_skills: '',
        contacto_nome: '',
        contacto_email: '',
        empresa_id: '' // Adicionado para seleção de empresa
    });

    // Estado original para verificar mudanças
    const [originalData, setOriginalData] = useState({});

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

        fetchEmpresas();
        fetchProposal();
    }, [navigate, proposal_id]);

    const fetchEmpresas = async () => {
        try {
            setLoadingEmpresas(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:3000/companies/companies', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmpresas(response.data.data || []);
        } catch (err) {
            console.error('Erro ao carregar empresas:', err);
            setError('Erro ao carregar lista de empresas.');
        } finally {
            setLoadingEmpresas(false);
        }
    };

    const fetchProposal = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            const response = await axios.get(`http://localhost:3000/proposals/proposals/${proposal_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const proposal = response.data.data;
            
            // Formatar data para input date
            const formatDateForInput = (dateString) => {
                if (!dateString) return '';
                return new Date(dateString).toISOString().split('T')[0];
            };

            const proposalData = {
                titulo: proposal.titulo || '',
                descricao: proposal.descricao || '',
                tipo_proposta: proposal.tipo_proposta || '',
                local_trabalho: proposal.local_trabalho || '',
                prazo_candidatura: formatDateForInput(proposal.prazo_candidatura),
                tipo_contrato: proposal.tipo_contrato || '',
                perfil_candidato: proposal.perfil_candidato || '',
                competencias_tecnicas: proposal.competencias_tecnicas || '',
                soft_skills: proposal.soft_skills || '',
                contacto_nome: proposal.contacto_nome || '',
                contacto_email: proposal.contacto_email || '',
                empresa_id: proposal.empresa_id || '' // Carregar empresa atual
            };

            setFormData(proposalData);
            setOriginalData(proposalData);

        } catch (err) {
            console.error('Erro ao carregar proposta:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('authToken');
                navigate('/login');
            } else if (err.response?.status === 404) {
                setError('Proposta não encontrada.');
            } else {
                setError('Erro ao carregar dados da proposta.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // Verificar se houve mudanças
            const hasChanges = Object.keys(formData).some(key => 
                formData[key] !== originalData[key]
            );

            if (!hasChanges) {
                setError('Nenhuma alteração foi feita.');
                setSubmitting(false);
                return;
            }

            // Validações básicas
            if (!formData.titulo.trim()) {
                setError('O título é obrigatório.');
                setSubmitting(false);
                return;
            }

            if (!formData.tipo_proposta) {
                setError('O tipo de proposta é obrigatório.');
                setSubmitting(false);
                return;
            }

            if (formData.contacto_email && !isValidEmail(formData.contacto_email)) {
                setError('Por favor, insira um email de contacto válido.');
                setSubmitting(false);
                return;
            }

            const token = localStorage.getItem('authToken');
            
            // Preparar dados para envio
            const updateData = {
                ...formData,
                empresa_id: formData.empresa_id || null // Enviar null se não houver empresa selecionada
            };
            
            await axios.put(`http://localhost:3000/proposals/proposals/${proposal_id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Proposta atualizada com sucesso!');
            setOriginalData(formData);

            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/gestor/ver-propostas');
            }, 2000);

        } catch (err) {
            console.error('Erro ao atualizar proposta:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('authToken');
                navigate('/login');
            } else if (err.response?.status === 404) {
                setError('Proposta não encontrada.');
            } else {
                setError(err.response?.data?.message || 'Erro ao atualizar proposta.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges()) {
            if (window.confirm('Tem alterações não guardadas. Deseja sair sem guardar?')) {
                navigate('/gestor/ver-propostas');
            }
        } else {
            navigate('/gestor/ver-propostas');
        }
    };

    const hasUnsavedChanges = () => {
        return Object.keys(formData).some(key => 
            formData[key] !== originalData[key]
        );
    };

    const getEmpresaAtual = () => {
        if (!formData.empresa_id) return null;
        return empresas.find(emp => emp.id === parseInt(formData.empresa_id));
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">A carregar...</span>
                    </div>
                    <p className="mt-2">A carregar dados da proposta...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card shadow">
                        <div className="card-header">
                            <div className="d-flex justify-content-between align-items-center">
                                <h4 className="mb-0">
                                    <i className="bi bi-pencil"></i> Editar Proposta
                                </h4>
                                <div>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary me-2"
                                        onClick={handleCancel}
                                    >
                                        <i className="bi bi-arrow-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-triangle"></i> {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    <i className="bi bi-check-circle"></i> {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Seleção de Empresa */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h5 className="border-bottom pb-2">
                                            <i className="bi bi-building"></i> Empresa Associada
                                        </h5>
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-8">
                                        <label htmlFor="empresa_id" className="form-label">
                                            Selecionar Empresa
                                        </label>
                                        {loadingEmpresas ? (
                                            <div className="d-flex align-items-center">
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">A carregar...</span>
                                                </div>
                                                <span>A carregar empresas...</span>
                                            </div>
                                        ) : (
                                            <select
                                                className="form-select"
                                                id="empresa_id"
                                                name="empresa_id"
                                                value={formData.empresa_id}
                                                onChange={handleChange}
                                            >
                                                <option value="">Selecione uma empresa (opcional)</option>
                                                {empresas.map(empresa => (
                                                    <option key={empresa.id} value={empresa.id}>
                                                        {empresa.nome_empresa} - {empresa.user?.nome || 'N/A'}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <div className="form-text">
                                            Deixe em branco se a proposta não estiver associada a uma empresa específica.
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        {getEmpresaAtual() && (
                                            <div className="mt-4">
                                                <div className="alert alert-info">
                                                    <h6 className="mb-1">Empresa Atual:</h6>
                                                    <strong>{getEmpresaAtual().nome_empresa}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        {getEmpresaAtual().user?.nome || 'N/A'}
                                                    </small>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Informações Básicas */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h5 className="border-bottom pb-2">
                                            <i className="bi bi-info-circle"></i> Informações Básicas
                                        </h5>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-8">
                                        <label htmlFor="titulo" className="form-label">
                                            Título da Proposta <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="titulo"
                                            name="titulo"
                                            value={formData.titulo}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label htmlFor="tipo_proposta" className="form-label">
                                            Tipo de Proposta <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            id="tipo_proposta"
                                            name="tipo_proposta"
                                            value={formData.tipo_proposta}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="emprego">Emprego</option>
                                            <option value="estágio">Estágio</option>
                                            <option value="outra">Outra</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="local_trabalho" className="form-label">
                                            Local de Trabalho
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="local_trabalho"
                                            name="local_trabalho"
                                            value={formData.local_trabalho}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label htmlFor="tipo_contrato" className="form-label">
                                            Tipo de Contrato
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="tipo_contrato"
                                            name="tipo_contrato"
                                            value={formData.tipo_contrato}
                                            onChange={handleChange}
                                            placeholder="Ex: Full-time, Part-time"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label htmlFor="prazo_candidatura" className="form-label">
                                            Prazo de Candidatura
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="prazo_candidatura"
                                            name="prazo_candidatura"
                                            value={formData.prazo_candidatura}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="descricao" className="form-label">
                                        Descrição da Proposta
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="descricao"
                                        name="descricao"
                                        rows="4"
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        placeholder="Descreva a proposta..."
                                    />
                                </div>

                                {/* Requisitos e Competências */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h5 className="border-bottom pb-2">
                                            <i className="bi bi-person-check"></i> Requisitos e Competências
                                        </h5>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="perfil_candidato" className="form-label">
                                        Perfil do Candidato
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="perfil_candidato"
                                        name="perfil_candidato"
                                        rows="3"
                                        value={formData.perfil_candidato}
                                        onChange={handleChange}
                                        placeholder="Descreva o perfil ideal do candidato..."
                                    />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="competencias_tecnicas" className="form-label">
                                            Competências Técnicas
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="competencias_tecnicas"
                                            name="competencias_tecnicas"
                                            rows="3"
                                            value={formData.competencias_tecnicas}
                                            onChange={handleChange}
                                            placeholder="Ex: JavaScript, React, Node.js..."
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="soft_skills" className="form-label">
                                            Soft Skills
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="soft_skills"
                                            name="soft_skills"
                                            rows="3"
                                            value={formData.soft_skills}
                                            onChange={handleChange}
                                            placeholder="Ex: Comunicação, Trabalho em equipa..."
                                        />
                                    </div>
                                </div>

                                {/* Informações de Contacto */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <h5 className="border-bottom pb-2">
                                            <i className="bi bi-telephone"></i> Informações de Contacto
                                        </h5>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="contacto_nome" className="form-label">
                                            Nome de Contacto
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="contacto_nome"
                                            name="contacto_nome"
                                            value={formData.contacto_nome}
                                            onChange={handleChange}
                                            placeholder="Nome da pessoa de contacto"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="contacto_email" className="form-label">
                                            Email de Contacto
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="contacto_email"
                                            name="contacto_email"
                                            value={formData.contacto_email}
                                            onChange={handleChange}
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleCancel}
                                        disabled={submitting}
                                    >
                                        <i className="bi bi-x"></i> Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                A atualizar...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check"></i> Atualizar Proposta
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentEditProposal;