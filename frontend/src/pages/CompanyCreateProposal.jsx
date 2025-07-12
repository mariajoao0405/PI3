import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken } from '../componentes/jwtdecode';
import axios from 'axios';
import Sidebar from '../componentes/Sidebar'

const CompanyCreateProposal = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [empresaId, setEmpresaId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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

    // Obter ID do utilizador (empresa) e respetivo perfil
    useEffect(() => {
        const id = getUserIdFromToken();
        if (!id) {
            navigate('/login');
            return;
        }
        setUserId(id);

        const fetchEmpresaId = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`https://pi3-q1c2.onrender.com/companies/user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const dados = Array.isArray(res.data?.data) ? res.data.data[0] : null;
                if (!dados || !dados.id) {
                    setError('Perfil da empresa não encontrado.');
                } else {
                    setEmpresaId(dados.id);
                }
            } catch (err) {
                setError('Erro ao carregar perfil da empresa.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmpresaId();
    }, [navigate]);

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');

            await axios.post('https://pi3-q1c2.onrender.com/proposals/proposals', {
                ...form,
                empresa_id: empresaId,
                prazo_candidatura: new Date(form.prazo_candidatura),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Proposta criada com sucesso!');
            setError('');
            setForm({
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
        } catch (err) {
            console.error(err);
            setError('Erro ao criar proposta.');
            setSuccess('');
        }
    };

    if (loading) return <p className="container mt-5">A carregar...</p>;

    return (
        <div className="d-flex">
         <Sidebar />
            <div className="container mt-5">
                <h2>Criar Proposta da Empresa</h2>

                {success && <div className="alert alert-success mt-3">{success}</div>}
                {error && <div className="alert alert-danger mt-3">{error}</div>}

                {!empresaId ? (
                    <p className="text-muted">Não foi possível obter o ID da empresa.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-4">
                        {/* mesmo formulário da versão anterior, mas sem o dropdown de empresa */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Título</label>
                            <input type="text" className="form-control" name="titulo" value={form.titulo} onChange={handleChange} required />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Tipo de Proposta</label>
                            <select name="tipo_proposta" className="form-select" value={form.tipo_proposta} onChange={handleChange}>
                                <option value="emprego">Emprego</option>
                                <option value="estágio">Estágio</option>
                                <option value="outra">Outra</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Descrição</label>
                            <textarea className="form-control" name="descricao" value={form.descricao} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Perfil do Candidato</label>
                            <input type="text" className="form-control" name="perfil_candidato" value={form.perfil_candidato} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Local de Trabalho</label>
                            <input type="text" className="form-control" name="local_trabalho" value={form.local_trabalho} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Prazo de Candidatura</label>
                            <input type="date" className="form-control" name="prazo_candidatura" value={form.prazo_candidatura} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Tipo de Contrato</label>
                            <input type="text" className="form-control" name="tipo_contrato" value={form.tipo_contrato} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Competências Técnicas</label>
                            <textarea className="form-control" name="competencias_tecnicas" value={form.competencias_tecnicas} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Soft Skills</label>
                            <textarea className="form-control" name="soft_skills" value={form.soft_skills} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Nome do Contacto</label>
                            <input type="text" className="form-control" name="contacto_nome" value={form.contacto_nome} onChange={handleChange} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Email do Contacto</label>
                            <input type="email" className="form-control" name="contacto_email" value={form.contacto_email} onChange={handleChange} />
                        </div>

                        <button type="submit" className="btn btn-dark mb-4">Criar Proposta</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CompanyCreateProposal;
