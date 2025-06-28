import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getUserRoleFromToken } from '../componentes/jwtdecode';

const PaginaLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpar erro anterior
    
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      });

      const { token } = response.data;
      
      // Armazenar o token
      localStorage.setItem('authToken', token);
      
      // Aguardar um pouco para garantir que o token foi armazenado
      setTimeout(() => {
        const userRole = getUserRoleFromToken();
        console.log('User role:', userRole); // Para debug
        
        switch (userRole) {
          case 'administrador':
            navigate('/admin');
            break;
          case 'departamento':
            navigate('/departamento');
            break;
          case 'empresa':
            navigate('/empresa');
            break;
          case 'estudante':
            navigate('/propostas');
            break;
          default:
            console.log('Role não reconhecido:', userRole);
            navigate('/');
        }
      }, 100); // Pequeno delay para garantir que o localStorage foi atualizado
      
    } catch (err) {
      console.error('Erro no login:', err);
      if (err.response?.status === 403) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso negado!',
          text: 'Conta bloqueada. Contacte o administrador.',
          background: '#2c2c2c',
          color: '#ffffff',
          confirmButtonColor: '#ffc107',
        });
      } else {
        setError('Email ou senha inválidos.');
      }
    }
  };

  return (
    <div className="container-fluid p-0 d-flex min-vh-100">
      <div className="col-lg-5 col-md-12 p-0" style={{ backgroundColor: '#121212' }}>
        <div className="text-center text-light d-flex justify-content-center align-items-center min-vh-100">
        </div>
      </div>

      <div className="col-lg-7 col-md-12 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#2a2a2a' }}>
        <div className="login-form text-light p-4 w-100" style={{ maxWidth: '400px' }}>
          <h2 className="mb-4 text-center">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email institucional ou pessoal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ backgroundColor: '#121212', opacity: '0.4', border: 'none', color: 'white' }}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Palavra-Passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ backgroundColor: '#121212', opacity: '0.4', border: 'none', color: 'white' }}
              />
            </div>
            <button type="submit" className="btn btn-warning w-100 mt-3" style={{ color: 'white' }}>
              Login
            </button>
            {error && <p className="text-danger mt-3">{error}</p>}
          </form>

          <div className="mt-3 text-end">
            <button
              onClick={() => navigate('/recuperarPassword')}
              style={{
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Esqueceu-se da password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;