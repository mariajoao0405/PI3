import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { getUserRoleFromToken } from '../componentes/jwtdecode';
import logoIPV from '../assets/LOGOIPV.png';

const PaginaLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para lidar com mudanças nos inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando user começar a digitar
    if (error) setError('');
  };

  // Função principal de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validação básica
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:3000/auth/login', {
        email: formData.email.trim(),
        password: formData.password
      });

      const { token } = response.data;
      
      if (!token) {
        throw new Error('Token não recebido do servidor');
      }

      // Armazenar o token
      localStorage.setItem('authToken', token);
      
      // Verificar role e redirecionar
      const userRole = getUserRoleFromToken();
      console.log('Login realizado com sucesso. Role:', userRole);
      
      // Redirecionar baseado no role
      redirectByRole(userRole);
      
    } catch (err) {
      console.error('Erro no login:', err);
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  // Função para redirecionar baseado no role
  const redirectByRole = (userRole) => {
    const routes = {
      'administrador': '/admin',
      'gestor': '/gestor',
      'empresa': '/empresa',
      'estudante': '/estudante'
    };

    const route = routes[userRole];
    if (route) {
      navigate(route, { replace: true });
    } else {
      console.warn('Role não reconhecido:', userRole);
      setError('Tipo de utilizador não reconhecido. Contacte o administrador.');
    }
  };

  // Função para lidar com erros de login
  const handleLoginError = (err) => {
    if (err.response?.status === 403) {
      Swal.fire({
        icon: 'error',
        title: 'Acesso Negado!',
        text: 'Conta bloqueada ou inativa. Contacte o administrador.',
        background: '#ffffff',
        color: '#333333',
        confirmButtonColor: '#2d5a3d',
        confirmButtonText: 'Entendi'
      });
    } else if (err.response?.status === 401) {
      setError('Email ou palavra-passe incorretos.');
    } else if (err.response?.status === 500) {
      setError('Erro interno do servidor. Tente novamente mais tarde.');
    } else if (err.code === 'NETWORK_ERROR' || !err.response) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } else {
      setError(err.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            
            {/* Logo Section */}
            <div className="text-center mb-4">
              <div className="mb-4">
                <img 
                  src={logoIPV}
                  alt="IPV Logo" 
                  className="img-fluid"
                  style={{ 
                    maxWidth: '300px', 
                    height: 'auto', 
                    objectFit: 'contain' 
                  }}
                />
              </div>
            </div>

            {/* Login Card */}
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h3 className="fw-bold" style={{ color: '#2c3e50' }}>
                    Bem-vindo de volta!
                  </h3>
                  <p className="text-muted">Faça login para continuar</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-medium" style={{ color: '#666' }}>
                      Email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ backgroundColor: '#f8f9fa' }}>
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control border-0"
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '12px 16px',
                          fontSize: '1rem'
                        }}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Digite seu email institucional"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium" style={{ color: '#666' }}>
                      Palavra-passe <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ backgroundColor: '#f8f9fa' }}>
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control border-0"
                        style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '12px 16px',
                          fontSize: '1rem'
                        }}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Digite sua palavra-passe"
                        disabled={loading}
                        minLength="6"
                      />
                    </div>
                  </div>

                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn text-white py-3 fw-semibold position-relative"
                      style={{ 
                        backgroundColor: loading ? '#6c757d' : '#2d5a3d',
                        borderRadius: '25px',
                        fontSize: '1.1rem',
                        border: 'none'
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Entrando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Entrar
                        </>
                      )}
                    </button>
                  </div>
                </form>

               
              </div>
            </div>

            {/* Botão Voltar */}
            <div className="text-center mt-3">
              <button 
                className="btn btn-link text-decoration-none"
                style={{ color: '#6c757d' }}
                onClick={() => navigate('/')}
                disabled={loading}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Voltar à página inicial
              </button>
            </div>

            {/* Informações adicionais */}
            <div className="text-center mt-4">
              <small className="text-muted">
                <i className="bi bi-shield-check me-1"></i>
                Plataforma segura do Instituto Politécnico de Viseu
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;