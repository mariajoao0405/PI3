import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../componentes/Sidebar'

const PaginaDepartamentos = () => {
  const [showModal, setShowModal] = useState(false);
  const [gestores, setGestores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [form, setForm] = useState({ departamento: '', user_id: '' });
  const [mensagem, setMensagem] = useState('');
  const [token, setToken] = useState('');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('authToken');
    if (!t) return window.location.href = '/login';
    setToken(t);
    fetchGestores(t);
    fetchDepartamentos(t);
  }, []);

  const fetchGestores = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/users/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const gestoresFiltrados = (response.data.data || []).filter(
        u => u.tipo_utilizador === 'gestor'
      );
      setGestores(gestoresFiltrados);
    } catch (err) {
      console.error('Erro ao buscar gestores:', err);
      setMensagem('Erro ao carregar lista de gestores.');
    }
  };

  const fetchDepartamentos = async (token) => {
    try {
      const res = await axios.get('http://localhost:3000/managers/managers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDepartamentos(res.data.data || []);
    } catch (err) {
      console.error("Erro ao buscar departamentos:", err);
      setMensagem("Erro ao carregar departamentos.");
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMensagem('');
    try {
      if (modoEdicao && editId !== null) {
        const res = await axios.put(`http://localhost:3000/managers/managers/${editId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setMensagem('Departamento atualizado com sucesso!');
      } else {
        const res = await axios.post('http://localhost:3000/managers/managers', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setMensagem(`Departamento "${form.departamento}" criado com sucesso.`);
      }
      setShowModal(false);
      setForm({ departamento: '', user_id: '' });
      setModoEdicao(false);
      setEditId(null);
      await fetchDepartamentos(token);
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao processar o formulário.';
      setMensagem(msg);
    }
  };

  const handleEdit = (dep) => {
    setForm({
      departamento: dep.departamento,
      user_id: dep.user_id
    });
    setModoEdicao(true);
    setEditId(dep.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tens a certeza que queres eliminar este departamento?')) return;
    try {
      const res = await axios.delete(`http://localhost:3000/managers/managers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMensagem('Departamento eliminado com sucesso.');
        await fetchDepartamentos(token);
      }
    } catch (error) {
      console.error('Erro ao eliminar:', error);
      setMensagem('Erro ao eliminar departamento.');
    }
  };

  return (
    <div className="d-flex">
     <Sidebar />
      <div className="container mt-5">
        <h2>Departamentos</h2>

        <button className="btn btn-success mb-3" onClick={() => {
          setShowModal(true);
          setModoEdicao(false);
          setEditId(null);
          setForm({ departamento: '', user_id: '' });
        }}>
          Adicionar Departamento
        </button>

        {mensagem && <div className="alert alert-info">{mensagem}</div>}

        {showModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">{modoEdicao ? 'Editar Departamento' : 'Novo Departamento'}</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Nome do Departamento</label>
                      <input
                        type="text"
                        className="form-control"
                        name="departamento"
                        value={form.departamento}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Gestor Responsável</label>
                      <select
                        className="form-select"
                        name="user_id"
                        value={form.user_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecionar gestor</option>
                        {gestores.map(gestor => (
                          <option key={gestor.id} value={gestor.id}>
                            {gestor.nome} ({gestor.email_institucional || gestor.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-success">{modoEdicao ? 'Guardar Alterações' : 'Criar'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {departamentos.length > 0 ? (
          <table className="table table-dark table-striped table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Departamento</th>
                <th>Gestor</th>
                <th>Email</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {departamentos.map(dep => (
                <tr key={dep.id}>
                  <td>{dep.id}</td>
                  <td>{dep.departamento}</td>
                  <td>{dep.user?.nome || 'N/A'}</td>
                  <td>{dep.user?.email_institucional || 'N/A'}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(dep)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(dep.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-4">Nenhum departamento criado ainda.</p>
        )}
      </div>
    </div>
  );
};

export default PaginaDepartamentos;
