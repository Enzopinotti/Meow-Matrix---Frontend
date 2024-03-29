import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="error-container">
      <img src="/img/not_found.png" alt="Error" className="error-image" />
      <h2 className="error-message">¡Oops! Parece que te has perdido en el camino</h2>
      <Link to="/" className="error-link">Volver a la página principal</Link>
    </div>
  );
}

export default NotFound;