import React from 'react';
import { Link } from 'react-router-dom';

const AuthPopup = () => {
  return (
    <div>
      <p>Debes iniciar sesión o registrarte para acceder a esta página.</p>
      <Link to="/login">Iniciar sesión</Link>
      <Link to="/register">Registrarse</Link>
    </div>
  );
};

export default AuthPopup;