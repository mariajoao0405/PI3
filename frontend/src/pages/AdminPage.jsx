import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserRoleFromToken } from '../componentes/jwtdecode';

const PaginaAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [mensagemForm, setMensagemForm] = useState('');
  const [form, setForm] = useState({
    nome: '',
    email_institucional: '',
    password: '',
    tipo_utilizador: 'estudante'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchUsers = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return navigate('/login');

      const userRole = getUserRoleFromToken();
      if (userRole !== 'administrador') return navigate('/login');

      await fetchUsers(token);
    };

    checkAuthAndFetchUsers();
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('http://localhost:3000/users/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      let userData = [];
      if (Array.isArray(response.data)) userData = response.data;
      else if (Array.isArray(response.data?.data)) userData = response.data.data;
      else if (Array.isArray(response.data?.users)) userData = response.data.users;
      else {
        const keys = Object.keys(response.data || {});
        for (const key of keys) {
          if (Array.isArray(response.data[key])) {
            userData = response.data[key];
            break;
          }
        }
      }
      setUsers(userData);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError('Erro ao carregar utilizadores. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setMensagemForm('');
    setForm({ nome: '', email: '', password: '', tipo_utilizador: 'estudante' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMensagemForm('');
    try {
      const res = await axios.post('http://localhost:3000/users/users/role', form);
      if (res.data.success) {
        setMensagemForm(`Utilizador ${res.data.data.nome} criado com sucesso!`);
        await fetchUsers(localStorage.getItem('authToken'));
        handleCloseModal();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao criar utilizador.';
      setMensagemForm(msg);
    }
  };

  const getUserId = user => user.id_user || user.id || user.userId || user.ID || 'N/A';
  const getUserEmail = user => user.email_institucional || 'N/A';


  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Utilizadores do Sistema</h2>
        <button className="btn btn-success" onClick={handleShowModal}>
          Criar Utilizador
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="mt-2">Carregando utilizadores...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : users.length === 0 ? (
        <p>Não há utilizadores disponíveis.</p>
      ) : (
        <table className="table table-dark table-striped table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Ativo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={getUserId(user) || index}>
                <td>{getUserId(user)}</td>
                <td>{user.nome || 'N/A'}</td>
                <td>{getUserEmail(user)}</td>
                <td>{user.tipo_utilizador || 'N/A'}</td>
                <td>{user.ativo !== undefined ? (user.ativo ? 'Sim' : 'Não') : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Criar Novo Utilizador</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  {mensagemForm && <div className="alert alert-danger">{mensagemForm}</div>}
                  <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input type="text" className="form-control" name="nome" value={form.nome} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo de Utilizador</label>
                    <select className="form-select" name="tipo_utilizador" value={form.tipo_utilizador} onChange={handleChange}>
                      {['administrador', 'gestor', 'estudante', 'empresa'].map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">Criar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaAdmin;
