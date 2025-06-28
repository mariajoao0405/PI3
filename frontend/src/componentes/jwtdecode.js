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
        return null;
    }

    try {
        const decodedToken = jwtDecode(token);
        return decodedToken.id || null;
    } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
        return null;
    }
};