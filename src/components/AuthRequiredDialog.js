import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from './Contexts/AuthContext';

const AuthRequiredDialog = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    // Define las rutas que requieren autenticación
    const authRequiredRoutes = ['/cart', '/profile'];

    // Verifica si la ruta actual requiere autenticación
    const isAuthRequired = authRequiredRoutes.some(route => location.pathname.startsWith(route));

    return (
        <div className="auth-required-dialog" style={{ display: isAuthRequired && !user ? 'block' : 'none' }}>
            <p>Por favor, inicia sesión o regístrate para continuar.</p>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
        </div>
    );
};

export default AuthRequiredDialog;
