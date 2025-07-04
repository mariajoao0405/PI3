import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../componentes/Sidebar'

const CompanyProfile = () => {
    const { user_id } = useParams();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState({
        nome_empresa: '',
        nif: '',
        website: '',
        morada: '',
        telefone_contacto: ''
    });

    useEffect(() => {
        if (!user_id || user_id === 'null' || user_id === 'undefined') {
            setError('ID do usuário inválido');
            setLoading(false);
            return;
        }

        const fetchPerfil = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await axios.get(`http://localhost:3000/companies/user/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // ✅ Corrigido: pega o primeiro item do array
                const dados = Array.isArray(res.data?.data) ? res.data.data[0] : null;
                setPerfil(dados);

                if (dados) {
                    setForm({
                        nome_empresa: dados.nome_empresa || '',
                        nif: dados.nif || '',
                        website: dados.website || '',
                        morada: dados.morada || '',
                        telefone_contacto: dados.telefone_contacto || ''
                    });
                }
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                } else {
                    setError('Erro ao carregar perfil.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, [user_id, navigate]);


    const isPerfilVazio = (p) => {
        if (!p) return true;
        return !p.nome_empresa && !p.nif && !p.website && !p.morada && !p.telefone_contacto;
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            await axios.post('http://localhost:3000/companies/companies', {
                ...form,
                user_id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Perfil criado/atualizado com sucesso!');
            window.location.reload();
        } catch (err) {
            alert('Erro ao criar perfil');
        }
    };

    const renderField = (label, name, type = 'text', textarea = false) => (
        <div className="mb-3">
            <label className="form-label fw-semibold">{label}</label>
            {textarea ? (
                <textarea
                    className="form-control bg-light border-0 rounded shadow-sm"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                />
            ) : (
                <input
                    type={type}
                    className="form-control bg-light border-0 rounded shadow-sm"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                />
            )}
        </div>
    );

    if (loading) return <p>A carregar...</p>;

    return (
        <div className="d-flex">
         <Sidebar />
            <div className="container py-4">
                <div className="bg-white rounded-4 shadow p-4">
                    <div className="d-flex align-items-center mb-4">
                        <div className="rounded-circle bg-secondary me-3" style={{ width: 80, height: 80 }}></div>
                        <div>
                            <h4 className="mb-0">{perfil?.nome_empresa || 'Perfil da Empresa'}</h4>
                            <small className="text-muted">Empresa</small>
                        </div>
                    </div>

                    <h5 className="bg-dark text-white rounded px-3 py-2">Perfil</h5>

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    {!perfil || isPerfilVazio(perfil) ? (
                        !formVisible ? (
                            <div className="mt-4">
                                <p className="text-muted">Você ainda não tem os dados da empresa preenchidos.</p>
                                <button className="btn btn-primary" onClick={() => setFormVisible(true)}>
                                    Preencher Perfil
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-4">
                                <div className="row">
                                    <div className="col-md-6">
                                        {renderField('Nome da Empresa', 'nome_empresa')}
                                    </div>
                                    <div className="col-md-6">
                                        {renderField('NIF', 'nif')}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        {renderField('Website', 'website')}
                                    </div>
                                    <div className="col-md-6">
                                        {renderField('Telefone de Contato', 'telefone_contacto')}
                                    </div>
                                </div>

                                {renderField('Morada', 'morada', 'text', true)}

                                <div className="d-flex justify-content-end gap-3 mt-3">
                                    <button type="submit" className="btn btn-dark px-4">Guardar</button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger px-4"
                                        onClick={() => navigate('/empresa')}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )
                    ) : (
                        <div className="mt-4">
                            <p><strong>Nome da Empresa:</strong> {perfil.nome_empresa}</p>
                            <p><strong>NIF:</strong> {perfil.nif}</p>
                            <p><strong>Website:</strong> {perfil.website}</p>
                            <p><strong>Telefone de Contato:</strong> {perfil.telefone_contacto}</p>
                            <p><strong>Morada:</strong> {perfil.morada}</p>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;
