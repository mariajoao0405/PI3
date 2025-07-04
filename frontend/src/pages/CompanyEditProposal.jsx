import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getUserIdFromToken, getUserRoleFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar'

const CompanyEditProposal = () => {
    const navigate = useNavigate();
    const { proposal_id } = useParams();
    const [form, setForm] = useState({
        titulo: '',
        tipo_proposta: 'emprego',
        descricao: '',
        perfil_candidato: '',
        local_trabalho: '',
        prazo_candidatura: '',
        tipo_contrato: '',
        competencias_tecnicas: '',
        soft_skills: '',
        contacto_nome: '',
        contacto_email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userId, setUserId] = useState(null);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [proposta, setProposta] = useState(null);

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

                // Buscar dados da proposta
                const proposalRes = await axios.get(`http://localhost:3000/proposals/proposals/${proposal_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const proposal = proposalRes.data.data;
                setProposta(proposal);

                // Verificar se a proposta pertence à empresa
                if (proposal.empresa_id !== profile?.id) {
                    setError('Você não tem permissão para editar esta proposta.');
                    return;
                }

                // Preencher formulário com os dados da proposta
                setForm({
                    titulo: proposal.titulo || '',
                    tipo_proposta: proposal.tipo_proposta || 'emprego',
                    descricao: proposal.descricao || '',
                    perfil_candidato: proposal.perfil_candidato || '',
                    local_trabalho: proposal.local_trabalho || '',
                    prazo_candidatura: proposal.prazo_candidatura?.split('T')[0] || '',
                    tipo_contrato: proposal.tipo_contrato || '',
                    competencias_tecnicas: proposal.competencias_tecnicas || '',
                    soft_skills: proposal.soft_skills || '',
                    contacto_nome: proposal.contacto_nome || '',
                    contacto_email: proposal.contacto_email || ''
                });

            } catch (err) {
                console.error('Erro ao carregar dados:', err);
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

        fetchData();
    }, [proposal_id, navigate]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('authToken');
            
            // Preparar dados para envio (manter empresa_id original)
            const proposalData = {
                ...form,
                empresa_id: companyProfile.id, // Manter a empresa atual
                prazo_candidatura: form.prazo_candidatura ? new Date(form.prazo_candidatura).toISOString() : null
            };

            await axios.put(`http://localhost:3000/proposals/proposals/${proposal_id}`, proposalData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Proposta atualizada com sucesso!');
            
            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/empresa/ver-propostas');
            }, 2000);

        } catch (err) {
            console.error('Erro ao atualizar proposta:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('authToken');
                navigate('/login');
            } else {
                setError(err.response?.data?.error || 'Erro ao atualizar proposta.');
            }
        }
    };

  


    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">A carregar...</span>
                    </div>
                    <p className="mt-2">A carregar proposta...</p>
                </div>
            </div>
        );
    }

    if (error && !form.titulo) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/empresa/ver-propostas')}>
                    Voltar às Propostas
                </button>
            </div>
        );
    }

    return (
        <div className="d-flex">
         <Sidebar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2>Editar Proposta</h2>
                        {companyProfile && (
                            <p className="text-muted mb-0">
                                <strong>{companyProfile.nome_empresa}</strong>
                            </p>
                        )}
                    </div>
                   
                </div>


                {success && (
                    <div className="alert alert-success" role="alert">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="row g-3">
                    <div className="col-md-8">
                        <label className="form-label fw-semibold">Título da Proposta</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="titulo" 
                            value={form.titulo} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-semibold">Tipo de Proposta</label>
                        <select 
                            name="tipo_proposta" 
                            className="form-select" 
                            value={form.tipo_proposta} 
                            onChange={handleChange}
                            required
                        >
                            <option value="emprego">Emprego</option>
                            <option value="estágio">Estágio</option>
                            <option value="outra">Outra</option>
                        </select>
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold">Descrição</label>
                        <textarea 
                            className="form-control" 
                            name="descricao" 
                            rows="4"
                            value={form.descricao} 
                            onChange={handleChange}
                            placeholder="Descreva a proposta em detalhes..."
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Perfil do Candidato</label>
                        <textarea 
                            className="form-control" 
                            name="perfil_candidato" 
                            rows="3"
                            value={form.perfil_candidato} 
                            onChange={handleChange}
                            placeholder="Que tipo de candidato procura?"
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Local de Trabalho</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="local_trabalho" 
                            value={form.local_trabalho} 
                            onChange={handleChange}
                            placeholder="Ex: Porto, Remoto, Híbrido"
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Prazo de Candidatura</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            name="prazo_candidatura" 
                            value={form.prazo_candidatura} 
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Tipo de Contrato</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="tipo_contrato" 
                            value={form.tipo_contrato} 
                            onChange={handleChange}
                            placeholder="Ex: Contrato sem termo, Part-time"
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold">Competências Técnicas</label>
                        <textarea 
                            className="form-control" 
                            name="competencias_tecnicas" 
                            rows="3"
                            value={form.competencias_tecnicas} 
                            onChange={handleChange}
                            placeholder="Linguagens, frameworks, ferramentas..."
                        />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold">Soft Skills</label>
                        <textarea 
                            className="form-control" 
                            name="soft_skills" 
                            rows="3"
                            value={form.soft_skills} 
                            onChange={handleChange}
                            placeholder="Trabalho em equipa, comunicação, liderança..."
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Nome do Contacto</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="contacto_nome" 
                            value={form.contacto_nome} 
                            onChange={handleChange}
                            placeholder="Nome da pessoa de contacto"
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Email do Contacto</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            name="contacto_email" 
                            value={form.contacto_email} 
                            onChange={handleChange}
                            placeholder="email@empresa.com"
                        />
                    </div>

                    <div className="col-12 mt-4">
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary px-4">
                                Guardar Alterações
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary px-4" 
                                onClick={() => navigate('/empresa/ver-propostas')}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>

                {proposta?.estado === 'pendente' && (
                    <div className="alert alert-warning mt-4">
                        <strong>Nota:</strong> Esta proposta está pendente de validação pelo administrador. 
                        Após a validação, ela ficará visível para os candidatos.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyEditProposal;