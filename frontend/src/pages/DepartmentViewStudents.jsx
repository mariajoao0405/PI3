import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PaginaListarEstudantes = () => {
  const navigate = useNavigate();
  const [estudantes, setEstudantes] = useState([]);
  const [pedidosRemocao, setPedidosRemocao] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [token, setToken] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('authToken');
    if (!t) return window.location.href = '/login';
    setToken(t);
    fetchEstudantes(t);
  }, []);

  const fetchEstudantes = async (token) => {
    try {
      const res = await axios.get('http://localhost:3000/students/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEstudantes(res.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar estudantes:', err);
      setMensagem('Erro ao carregar estudantes.');
    }
  };

  const fetchPedidosRemocao = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/students/deletion-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPedidosRemocao(res.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos de remoção:', err);
      setMensagem('Erro ao carregar pedidos de remoção.');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovarRemocao = async (estudanteId) => {
    if (!window.confirm('Tem certeza que deseja aprovar a remoção desta conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Simplesmente eliminar o estudante diretamente
      const res = await axios.delete(`http://localhost:3000/students/students/${estudanteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMensagem('Conta do estudante removida com sucesso.');
        // Remover da lista de pedidos
        setPedidosRemocao(prev => prev.filter(p => p.id !== estudanteId));
        // Atualizar lista de estudantes
        await fetchEstudantes(token);
      }
    } catch (err) {
      console.error('Erro ao aprovar remoção:', err);
      setMensagem('Erro ao aprovar remoção da conta.');
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchPedidosRemocao();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMensagem('');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Perfis de Estudantes</h2>
          <p className="text-muted mb-0">{estudantes.length} estudante(s) registado(s)</p>
        </div>
        <div>
          <button
            className="btn btn-warning me-2"
            onClick={handleOpenModal}
          >
            <i className="bi bi-exclamation-triangle"></i> Pedidos de Remoção
          </button>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/admin')}
          >
            Dashboard
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {mensagem && <div className="alert alert-info">{mensagem}</div>}

      {/* Tabela de Estudantes */}
      {estudantes.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped mt-4">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Curso</th>
                <th>Ano</th>
                <th>Idade</th>
                <th>Áreas de Interesse</th>
                <th>Competências Técnicas</th>
                <th>Soft Skills</th>
                <th>CV</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {estudantes.map(est => (
                <tr key={est.id}>
                  <td>{est.id}</td>
                  <td>{est.user?.nome || 'N/A'}</td>
                  <td>{est.user?.email_institucional || 'N/A'}</td>
                  <td>{est.curso || 'N/A'}</td>
                  <td>{est.ano || 'N/A'}</td>
                  <td>{est.idade || 'N/A'}</td>
                  <td>
                    <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={est.areas_interesse}>
                      {est.areas_interesse || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={est.competencias_tecnicas}>
                      {est.competencias_tecnicas || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="text-truncate d-inline-block" style={{ maxWidth: '150px' }} title={est.soft_skills}>
                      {est.soft_skills || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {est.cv_url ? (
                      <a href={est.cv_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-file-earmark-pdf"></i> Ver CV
                      </a>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {est.remocao_solicitada ? (
                      <span className="badge bg-warning text-dark">
                        <i className="bi bi-exclamation-triangle"></i> Remoção Solicitada
                      </span>
                    ) : (
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle"></i> Ativo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info mt-4">
          <h5>Nenhum Estudante Registado</h5>
          <p className="mb-0">Não há estudantes registados no sistema ainda.</p>
        </div>
      )}

      {/* Modal de Pedidos de Remoção */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle text-warning"></i> Pedidos de Remoção de Conta
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">A carregar...</span>
                    </div>
                    <p className="mt-2">A carregar pedidos...</p>
                  </div>
                ) : pedidosRemocao.length > 0 ? (
                  <div>
                    <div className="alert alert-warning">
                      <strong>Atenção:</strong> {pedidosRemocao.length} estudante(s) solicitaram a remoção da conta.
                    </div>

                    {pedidosRemocao.map(pedido => (
                      <div key={pedido.id} className="card mb-3 border-warning">
                        <div className="card-body">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <h6 className="card-title mb-1">
                                <i className="bi bi-person-circle"></i> {pedido.user?.nome || 'N/A'}
                              </h6>
                              <p className="card-text mb-1">
                                <strong>Email:</strong> {pedido.user?.email_institucional || 'N/A'}
                              </p>
                              <p className="card-text mb-1">
                                <strong>Curso:</strong> {pedido.curso || 'N/A'}
                                {pedido.ano && ` - ${pedido.ano}º ano`}
                              </p>
                              <small className="text-muted">
                                <i className="bi bi-calendar"></i> ID do Perfil: #{pedido.id}
                              </small>
                            </div>
                            <div className="col-md-4 text-end">
                              <button
                                className="btn btn-danger"
                                onClick={() => handleAprovarRemocao(pedido.id)}
                              >
                                <i className="bi bi-check-circle"></i> Aprovar Remoção
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-success">
                    <h6><i className="bi bi-check-circle"></i> Nenhum Pedido Pendente</h6>
                    <p className="mb-0">Não há pedidos de remoção de conta pendentes no momento.</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaListarEstudantes;