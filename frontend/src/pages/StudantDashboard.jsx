// PaginaEstudante.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken } from '../componentes/jwtdecode';

const PaginaEstudante = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getUserIdFromToken();
    console.log('ID do usuário obtido do token:', id);
    
    if (!id) {
      console.error('ID do usuário não encontrado no token');
      // Redirecionar para login se não conseguir obter o ID
      navigate('/login');
      return;
    }
    
    setUserId(id);
    setLoading(false);
  }, [navigate]);

  const irParaPerfil = () => {
    if (userId) {
      console.log('Navegando para perfil com ID:', userId);
      navigate(`/perfil-estudante/${userId}`);
    } else {
      console.error('Não é possível navegar: ID do usuário não disponível');
      alert('Erro: ID do usuário não encontrado');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Bem-vindo, Estudante!</h2>
      <p>Seu ID: {userId}</p>
      <button 
        className="btn btn-primary mt-3" 
        onClick={irParaPerfil}
        disabled={!userId}
      >
        Ir para o meu perfil
      </button>
      
      <button 
        className="btn btn-secondary mt-3 ms-2" 
        onClick={() => {
          localStorage.removeItem('authToken');
          navigate('/login');
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default PaginaEstudante;
