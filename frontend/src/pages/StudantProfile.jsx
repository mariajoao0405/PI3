import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../componentes/Sidebar'

const PaginaPerfilEstudante = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [novoPerfil, setNovoPerfil] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    curso: '',
    ano: '',
    idade: '',
    areas_interesse: '',
    competencias_tecnicas: '',
    soft_skills: '',
    cv_url: ''
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
        const res = await axios.get(`https://pi3-q1c2.onrender.com/students/user/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPerfil(res.data.data);
        
        // Preencher form com dados existentes para edição
        if (res.data.data) {
          setForm({
            nome: res.data.data.nome || '',
            email: res.data.data.email_institucional || '',
            curso: res.data.data.curso || '',
            ano: res.data.data.ano || '',
            idade: res.data.data.idade || '',
            areas_interesse: res.data.data.areas_interesse || '',
            competencias_tecnicas: res.data.data.competencias_tecnicas || '',
            soft_skills: res.data.data.soft_skills || '',
            cv_url: res.data.data.cv_url || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setNovoPerfil(true);
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('authToken');
          navigate('/login');
        } else {
          setError('Erro ao carregar perfil.');
        }
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [user_id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      
      if (novoPerfil) {
        // Criar novo perfil
        await axios.post('https://pi3-q1c2.onrender.com/students/students', {
          ...form,
          user_id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNovoPerfil(false);
      } else {
        // Atualizar perfil existente
        await axios.put(`https://pi3-q1c2.onrender.com/students/students/${perfil.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditMode(false);
      }
      
      window.location.reload();
    } catch (err) {
      alert('Erro ao guardar perfil');
    }
  };

  const handleRequestDeletion = async () => {
    const confirmDelete = window.confirm(
      'Tem certeza que deseja solicitar a remoção da sua conta? Esta ação enviará um pedido aos administradores.'
    );
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post('https://pi3-q1c2.onrender.com/students/request-deletion', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Pedido de remoção enviado com sucesso. Será analisado pelos administradores.');
      
    } catch (err) {
      if (err.response?.status === 400) {
        alert('Você já solicitou a remoção desta conta.');
      } else {
        alert('Erro ao enviar pedido de remoção.');
      }
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      // Resetar form com dados atuais quando entrar em modo edição
      setForm({
        curso: perfil.curso || '',
        ano: perfil.ano || '',
        idade: perfil.idade || '',
        areas_interesse: perfil.areas_interesse || '',
        competencias_tecnicas: perfil.competencias_tecnicas || '',
        soft_skills: perfil.soft_skills || '',
        cv_url: perfil.cv_url || ''
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'EU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const renderField = (label, name, type = 'text', textarea = false) => (
    <div className="mb-4">
      <label className="form-label fw-medium" style={{ color: '#666' }}>{label}</label>
      {textarea ? (
        <textarea
          className="form-control border-0 rounded-3"
          style={{ backgroundColor: '#f8f9fa', padding: '12px 16px', minHeight: '100px' }}
          name={name}
          value={form[name]}
          onChange={handleChange}
        />
      ) : (
        <input
          type={type}
          className="form-control border-0 rounded-3"
          style={{ backgroundColor: '#f8f9fa', padding: '12px 16px' }}
          name={name}
          value={form[name]}
          onChange={handleChange}
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
                {getInitials(perfil?.user?.nome)}
              </div>
              <div>
                <h4 className="mb-0" style={{ color: '#2c3e50' }}>
                  {perfil?.user?.nome || 'Perfil do Estudante'}
                </h4>
                <p className="text-muted mb-0">Aluno</p>
              </div>
            </div>
            
            {/* Botões de ação */}
            {!novoPerfil && !editMode && (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleEditToggle}
                  style={{ borderRadius: '25px', padding: '8px 20px' }}
                >
                  <i className="bi bi-pencil"></i> Editar Perfil
                </button>
                <button 
                  className="btn btn-outline-danger"
                  onClick={handleRequestDeletion}
                  style={{ borderRadius: '25px', padding: '8px 20px' }}
                >
                  Pedir remoção de conta
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

              {novoPerfil || editMode ? (
                /* Formulário de edição */
                <form onSubmit={handleSubmit}>
                  {/* Informações básicas */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3 pb-2 border-bottom">Informações Básicas</h6>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      {renderField('Curso', 'curso')}
                    </div>
                    <div className="col-md-4">
                      {renderField('Ano', 'ano')}
                    </div>
                    <div className="col-md-4">
                      {renderField('Idade', 'idade', 'number')}
                    </div>
                  </div>

                  {/* Competências */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3 pb-2 border-bottom">Competências e Interesses</h6>
                    </div>
                  </div>

                  {renderField('Áreas de Interesse Profissional', 'areas_interesse', 'text', true)}
                  {renderField('Competências Técnicas', 'competencias_tecnicas', 'text', true)}
                  {renderField('Soft Skills', 'soft_skills', 'text', true)}

                  {/* Outros */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3 pb-2 border-bottom">Outros</h6>
                    </div>
                  </div>

                  {renderField('Link do CV', 'cv_url')}

                  {/* Botões */}
                  <div className="d-flex justify-content-end gap-3 mt-4">
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
                      Editar
                    </button>
                  </div>
                </form>
              ) : (
                /* Visualização do perfil */
                <div>
                  {/* Informações básicas */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3 pb-2 border-bottom">Informações Básicas</h6>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <span className="text-muted small">Nome Completo</span>
                        <p className="mb-0 fw-medium">{perfil?.user?.nome || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-muted small">Email</span>
                        <p className="mb-0 fw-medium">{perfil?.user?.email_institucional || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-muted small">Palavra-Passe</span>
                        <p className="mb-0 fw-medium">••••••••</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <span className="text-muted small">Curso</span>
                        <p className="mb-0 fw-medium">{perfil?.curso || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-muted small">Ano</span>
                        <p className="mb-0 fw-medium">{perfil?.ano || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <span className="text-muted small">Semestre</span>
                        <p className="mb-0 fw-medium">{perfil?.idade || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Competências */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3 pb-2 border-bottom">Áreas de Interesse Profissional</h6>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="mb-0">{perfil?.areas_interesse || 'N/A'}</p>
                  </div>

                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3 pb-2 border-bottom">Competências técnicas e soft skills</h6>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <span className="text-muted small">Competências Técnicas</span>
                        <p className="mb-0 fw-medium">{perfil?.competencias_tecnicas || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <span className="text-muted small">Soft Skills</span>
                        <p className="mb-0 fw-medium">{perfil?.soft_skills || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-muted mb-3 pb-2 border-bottom">Percurso Profissional</h6>
                    </div>
                  </div>

                  <div className="mb-4">
                    {perfil?.cv_url ? (
                      <div className="mb-3">
                        <div>
                          <a 
                            href={perfil.cv_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn btn-outline-primary btn-sm"
                            style={{ borderRadius: '20px', padding: '5px 15px' }}
                          >
                            <i className="bi bi-file-earmark-pdf"></i> Ver CV
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">N/A</p>
                    )}
                  </div>

                  {/* Mostrar se já solicitou remoção */}
                  {perfil?.remocao_solicitada && (
                    <div className="alert alert-warning">
                      <i className="bi bi-exclamation-triangle"></i> 
                      <strong> Pedido de Remoção Pendente:</strong> Você já solicitou a remoção desta conta. 
                      O pedido está sendo analisado pelos administradores.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaPerfilEstudante;