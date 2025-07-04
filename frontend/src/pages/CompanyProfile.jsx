import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../componentes/Sidebar'

const CompanyProfile = () => {
    const { user_id } = useParams();
    const navigate = useNavigate();
    const [perfil, setPerfil] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
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
                
                // Buscar dados do perfil da empresa
                const resEmpresa = await axios.get(`http://localhost:3000/companies/user/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Buscar dados do usuário
                const resUsuario = await axios.get(`http://localhost:3000/users/users/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const dados = Array.isArray(resEmpresa.data?.data) ? resEmpresa.data.data[0] : null;
                setPerfil(dados);
                setUserData(resUsuario.data.data);

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
        
        // Validação básica
        if (!form.nome_empresa.trim()) {
            setError('Nome da empresa é obrigatório.');
            return;
        }

        try {
            setError('');
            const token = localStorage.getItem('authToken');
            
            if (!perfil || isPerfilVazio(perfil)) {
                // Criar novo perfil
                await axios.post('http://localhost:3000/companies/companies', {
                    ...form,
                    user_id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Atualizar perfil existente
                await axios.put(`http://localhost:3000/companies/companies/${perfil.id}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            alert('Perfil atualizado com sucesso!');
            setEditMode(false);
            window.location.reload();
        } catch (err) {
            console.error('Erro ao atualizar perfil:', err);
            setError(err.response?.data?.error || 'Erro ao atualizar perfil');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'EM';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const renderField = (label, name, type = 'text', textarea = false, required = false) => (
        <div className="mb-4">
            <label className="form-label fw-medium" style={{ color: '#666' }}>
                {label}
                {required && <span className="text-danger ms-1">*</span>}
            </label>
            {textarea ? (
                <textarea
                    className="form-control border-0 rounded-3"
                    style={{ backgroundColor: '#f8f9fa', padding: '12px 16px', minHeight: '100px' }}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                />
            ) : (
                <input
                    type={type}
                    className="form-control border-0 rounded-3"
                    style={{ backgroundColor: '#f8f9fa', padding: '12px 16px' }}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={required}
                />
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="d-flex">
                <Sidebar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">A carregar...</span>
                        </div>
                        <p className="mt-2">A carregar perfil...</p>
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
                                style={{ width: '60px', height: '60px', fontSize: '20px', fontWeight: 'bold' }}
                            >
                                {getInitials(perfil?.nome_empresa || userData?.nome)}
                            </div>
                            <div>
                                <h4 className="mb-0" style={{ color: '#2c3e50' }}>
                                    {perfil?.nome_empresa || userData?.nome || 'Perfil da Empresa'}
                                </h4>
                                <p className="text-muted mb-0">Empresa</p>
                            </div>
                        </div>
                        
                        {/* Botões de ação */}
                        {perfil && !isPerfilVazio(perfil) && !editMode && (
                            <div className="d-flex gap-2">
                                <button 
                                    className="btn btn-outline-primary"
                                    onClick={() => setEditMode(true)}
                                    style={{ borderRadius: '25px', padding: '8px 20px' }}
                                >
                                    <i className="bi bi-pencil"></i> Editar Perfil
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Card principal do perfil */}
                    <div className="bg-white rounded-3 shadow-sm">
                        {/* Header do card */}
                        <div 
                            className="px-4 py-3 text-white rounded-top"
                            style={{ backgroundColor: '#2d5a3d' }}
                        >
                            <h5 className="mb-0">Perfil</h5>
                        </div>

                        {/* Conteúdo do card */}
                        <div className="p-4">
                            {error && <div className="alert alert-danger">{error}</div>}

                            {!perfil || isPerfilVazio(perfil) || editMode ? (
                                /* Formulário de edição */
                                <form onSubmit={handleSubmit}>
                                    {/* Informações básicas */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <h6 className="text-muted mb-3 pb-2 border-bottom">Informações da Empresa</h6>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            {renderField('Nome da Empresa', 'nome_empresa', 'text', false, true)}
                                        </div>
                                        <div className="col-md-6">
                                            {renderField('NIF/NIPC', 'nif')}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            {renderField('Website', 'website', 'url')}
                                        </div>
                                        <div className="col-md-6">
                                            {renderField('Telefone de Contacto', 'telefone_contacto', 'tel')}
                                        </div>
                                    </div>

                                    {/* Localização */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <h6 className="text-muted mb-3 pb-2 border-bottom">Localização</h6>
                                        </div>
                                    </div>

                                    {renderField('Morada Completa', 'morada', 'text', true)}

                                    {/* Botões */}
                                    <div className="d-flex justify-content-end gap-3 mt-4">
                                        {editMode && (
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                style={{ borderRadius: '25px', padding: '10px 30px' }}
                                                onClick={() => setEditMode(false)}
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                        <button 
                                            type="submit" 
                                            className="btn text-white"
                                            style={{ 
                                                backgroundColor: '#2d5a3d',
                                                borderRadius: '25px', 
                                                padding: '10px 30px',
                                                border: 'none'
                                            }}
                                        >
                                            {!perfil || isPerfilVazio(perfil) ? 'Criar Perfil' : 'Guardar Alterações'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* Visualização do perfil */
                                <div>
                                    {/* Informações básicas */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <h6 className="text-muted mb-3 pb-2 border-bottom">Informações da Empresa</h6>
                                        </div>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <span className="text-muted small">Nome da Empresa</span>
                                                <p className="mb-0 fw-medium">{perfil?.nome_empresa || 'N/A'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <span className="text-muted small">Email Institucional</span>
                                                <p className="mb-0 fw-medium">{userData?.email_institucional || 'N/A'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <span className="text-muted small">Website</span>
                                                <p className="mb-0 fw-medium">
                                                    {perfil?.website ? (
                                                        <a href={perfil.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                            {perfil.website}
                                                        </a>
                                                    ) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <span className="text-muted small">NIF/NIPC</span>
                                                <p className="mb-0 fw-medium">{perfil?.nif || 'N/A'}</p>
                                            </div>
                                            <div className="mb-3">
                                                <span className="text-muted small">Telefone de Contacto</span>
                                                <p className="mb-0 fw-medium">
                                                    {perfil?.telefone_contacto ? (
                                                        <a href={`tel:${perfil.telefone_contacto}`} className="text-primary">
                                                            {perfil.telefone_contacto}
                                                        </a>
                                                    ) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Localização */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <h6 className="text-muted mb-3 pb-2 border-bottom">Localização</h6>
                                        </div>
                                    </div>

                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <span className="text-muted small">Morada</span>
                                                <p className="mb-0 fw-medium">{perfil?.morada || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyProfile;