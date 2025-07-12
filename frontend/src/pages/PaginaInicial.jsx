import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoIPV from '../assets/LOGOIPV.png'; // ADICIONAR ESTE IMPORT

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center">
              {/* Logo */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <img 
                    src={logoIPV}
                    alt="FutureLink Logo" 
                    className="me-3"
                    style={{ width: '577.7516479492188px', height: '154px', objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="mb-4">
                <h1 className="mb-3" style={{ color: '#2c3e50', fontWeight: '600' }}>
                  Bem vindo!
                </h1>
                <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                  Conexões inteligentes para carreiras<br />
                  brilhantes.
                </p>
              </div>

              {/* Botão de Login */}
              <div className="d-grid gap-2">
                <button 
                  className="btn text-white py-3 fw-semibold"
                  style={{ 
                    backgroundColor: '#2d5a3d',
                    borderRadius: '25px',
                    fontSize: '1.1rem',
                    border: 'none'
                  }}
                  onClick={() => navigate('/login')}
                >
                  LOGIN
                </button>
                <button 
                  className="btn text-white py-3 fw-semibold"
                  style={{ 
                    backgroundColor: '#2d5a3d',
                    borderRadius: '25px',
                    fontSize: '1.1rem',
                    border: 'none',
                    marginTop: '10px'
                  }}
                  onClick={() => navigate('/registo')}
                >
                  REGISTO
                </button>
              </div>              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;