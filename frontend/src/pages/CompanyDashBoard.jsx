// CompanyDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdFromToken } from '../componentes/jwtdecode';
import Sidebar from '../componentes/Sidebar'

const CompanyDashboard = () => {
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

    const goToProfile = () => {
        if (userId) {
            console.log('Navegando para perfil com ID:', userId);
            navigate(`/perfil-empresa/${userId}`);
        } else {
            console.error('Não é possível navegar: ID do usuário não disponível');
            alert('Erro: ID do usuário não encontrado');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className ="d-flex">
         <Sidebar />
            <div className="container mt-5">
                <h2>Bem-vindo, Empresa!</h2>
                <button 
                    className="btn btn-primary mt-3" 
                    onClick={goToProfile}
                    disabled={!userId}
                >
                    Ir para o meu perfil
                </button>
                
            </div>
        </div>
    );
};

export default CompanyDashboard;