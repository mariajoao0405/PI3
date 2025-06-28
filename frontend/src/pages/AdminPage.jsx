import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserRoleFromToken } from '../componentes/jwtdecode';

const PaginaAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchUsers = async () => {
      const token = localStorage.getItem('authToken');
      
      // Verificar se o token existe
      if (!token) {
        navigate('/login');
        return;
      }

      // Verificar se o usuário é administrador
      const userRole = getUserRoleFromToken();
      
      if (userRole !== 'administrador') {
        navigate('/login');
        return;
      }

      // Buscar os usuários
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
      
      // Extrair os dados corretos - pode ser response.data.users ou response.data diretamente
      let userData = [];
      
      if (Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        userData = response.data.users;
      } else if (response.data && Array.isArray(response.data.data)) {
        userData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        const keys = Object.keys(response.data);
        
        for (const key of keys) {
          if (Array.isArray(response.data[key])) {
            userData = response.data[key];
            break;
          }
        }
      }
      
      setUsers(userData);
      
    } catch (error) {
      // Se erro de autenticação, redirecionar para login
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError('Erro ao carregar usuários. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  // Função para obter o ID do usuário (pode ser id, id_user, userId, etc.)
  const getUserId = (user) => {
    return user.id_user || user.id || user.userId || user.ID || 'N/A';
  };

  // Função para obter o email do usuário
  const getUserEmail = (user) => {
    return user.email_institucional || user.email || user.email_pessoal || 'N/A';
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Utilizadores do Sistema</h2>
        <button 
          className="btn btn-warning" 
          onClick={handleLogout}
          style={{ color: 'white' }}
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando utilizadores...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          {error}
        </div>
      ) : !Array.isArray(users) || users.length === 0 ? (
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
    </div>
  );
};

export default PaginaAdmin;