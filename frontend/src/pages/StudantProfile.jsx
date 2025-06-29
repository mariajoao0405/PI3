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
      await axios.post('http://localhost:3000/students/students', {
        ...form,
        user_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNovoPerfil(false);
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
    <div className="container py-4">
      <div className="bg-white rounded-4 shadow p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="rounded-circle bg-secondary me-3" style={{ width: 80, height: 80 }}></div>
          <div>
            <h4 className="mb-0">{perfil ? perfil.nome : 'Perfil'}</h4>
            <small className="text-muted">Aluno</small>
          </div>
        </div>

        <h5 className="bg-dark text-white rounded px-3 py-2">Perfil</h5>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        {novoPerfil ? (
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
            {renderField('Competências técnicas e soft skills', 'competencias_tecnicas', 'text', true)}
            {renderField('Soft Skills', 'soft_skills', 'text', true)}
            {renderField('Link do CV', 'cv_url')}

            <div className="d-flex justify-content-end gap-3 mt-3">
              <button type="submit" className="btn btn-dark px-4">Guardar</button>
              <button type="button" className="btn btn-outline-danger px-4" onClick={() => navigate('/estudante')}>Cancelar</button>
            </div>
          </form>
        ) : (
          <div className="mt-4">
            <p><strong>Curso:</strong> {perfil.curso}</p>
            <p><strong>Ano:</strong> {perfil.ano}</p>
            <p><strong>Idade:</strong> {perfil.idade}</p>
            <p><strong>Áreas de Interesse:</strong> {perfil.areas_interesse}</p>
            <p><strong>Competências Técnicas:</strong> {perfil.competencias_tecnicas}</p>
            <p><strong>Soft Skills:</strong> {perfil.soft_skills}</p>
            <p><strong>CV:</strong> <a href={perfil.cv_url} target="_blank" rel="noreferrer">Ver CV</a></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginaPerfilEstudante;
