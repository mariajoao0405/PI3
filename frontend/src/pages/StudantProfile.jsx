import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

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
        const res = await axios.get(`http://localhost:3000/students/user/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPerfil(res.data.data);
        
        // Preencher form com dados existentes para edição
        if (res.data.data) {
          setForm({
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
        await axios.post('http://localhost:3000/students/students', {
          ...form,
          user_id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNovoPerfil(false);
      } else {
        // Atualizar perfil existente
        await axios.put(`http://localhost:3000/students/students/${perfil.id}`, form, {
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
      await axios.post('http://localhost:3000/students/request-deletion', {}, {
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
    <div className="container py-4">
      <div className="bg-white rounded-4 shadow p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-secondary me-3" style={{ width: 80, height: 80 }}></div>
            <div>
              <h4 className="mb-0">{perfil ? perfil.user?.nome : 'Perfil'}</h4>
              <small className="text-muted">Aluno</small>
            </div>
          </div>
          
          {/* Botões de ação */}
          {!novoPerfil && !editMode && (
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleEditToggle}
              >
                <i className="bi bi-pencil"></i> Editar Perfil
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleRequestDeletion}
              >
                <i className="bi bi-trash"></i> Solicitar Remoção
              </button>
            </div>
          )}
        </div>

        <h5 className="bg-dark text-white rounded px-3 py-2">Perfil</h5>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {novoPerfil || editMode ? (
          <form onSubmit={handleSubmit} className="mt-4">
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
            {renderField('Áreas de interesse Profissional', 'areas_interesse', 'text', true)}
            {renderField('Competências técnicas', 'competencias_tecnicas', 'text', true)}
            {renderField('Soft Skills', 'soft_skills', 'text', true)}
            {renderField('Link do CV', 'cv_url')}

            <div className="d-flex justify-content-end gap-3 mt-3">
              <button type="submit" className="btn btn-dark px-4">
                {novoPerfil ? 'Guardar' : 'Atualizar'}
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary px-4" 
                onClick={() => {
                  if (novoPerfil) {
                    navigate('/estudante');
                  } else {
                    setEditMode(false);
                  }
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Curso:</strong> {perfil.curso || 'N/A'}</p>
                <p><strong>Ano:</strong> {perfil.ano || 'N/A'}</p>
                <p><strong>Idade:</strong> {perfil.idade || 'N/A'}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Áreas de Interesse:</strong> {perfil.areas_interesse || 'N/A'}</p>
                <p><strong>Competências Técnicas:</strong> {perfil.competencias_tecnicas || 'N/A'}</p>
                <p><strong>Soft Skills:</strong> {perfil.soft_skills || 'N/A'}</p>
              </div>
            </div>
            {perfil.cv_url && (
              <p><strong>CV:</strong> <a href={perfil.cv_url} target="_blank" rel="noreferrer" className="text-decoration-none">Ver CV</a></p>
            )}
            
            {/* Mostrar se já solicitou remoção */}
            {perfil.remocao_solicitada && (
              <div className="alert alert-warning mt-3">
                <i className="bi bi-exclamation-triangle"></i> 
                <strong> Pedido de Remoção Pendente:</strong> Você já solicitou a remoção desta conta. 
                O pedido está sendo analisado pelos administradores.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginaPerfilEstudante;