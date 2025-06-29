import {jwtDecode} from 'jwt-decode';

export const getUserRoleFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return null;
    }

    try {
        const decodedToken = jwtDecode(token);
        return decodedToken.tipo_utilizador || null;
    } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
        return null;
    }
};

export const getUserIdFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.log('Token não encontrado no localStorage');
        return null;
    }

    try {
        const decodedToken = jwtDecode(token);
        console.log('Token decodificado:', decodedToken);
        
        // Tentar diferentes propriedades para o ID
        const userId = decodedToken.id || 
                      decodedToken.id_user || 
                      decodedToken.userId || 
                      decodedToken.user_id ||
                      decodedToken.ID ||
                      null;
        
        console.log('ID extraído do token:', userId);
        return userId;
    } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
        return null;
    }
};