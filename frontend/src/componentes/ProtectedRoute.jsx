import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRoleFromToken } from './jwtdecode';

const ProtectedRoute = ({ element, allowedRoles }) => {
    const token = localStorage.getItem('authToken');
    const tipo_utilizador = getUserRoleFromToken();

    if (!token || !tipo_utilizador) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(tipo_utilizador)) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

export default ProtectedRoute;