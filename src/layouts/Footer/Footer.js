import React from 'react';
import { useLocation } from 'react-router-dom';


const Footer = () => {
  // Obtener la ubicación actual
  const location = useLocation();

  // Determinar si debemos renderizar los componentes en el Header
  const shouldRenderComponents = () => {
      return !(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/recoveryPass' || location.pathname.startsWith('/resetPassword/'));
  };

  // Si no se deben renderizar los componentes, retornar null
  if (!shouldRenderComponents()) {
      return null;
  }

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className="footer-title">¡Gracias por visitar nuestro sitio!</p>
        <p className="footer-text">Desarrollado con ❤️ por Enzo Pinotti</p>
        <p className="footer-text">Todos los derechos reservados &copy; 2024</p>
      </div>
    </footer>
  );
}

export default Footer;
