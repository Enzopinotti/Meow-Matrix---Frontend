import React, { useState } from 'react';
import Swal from 'sweetalert2';

const FormResetPass = ({ token }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas deben ser iguales',
        allowOutsideClick: false,
      });
      return;
    }

    if (password === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, completa el campo contraseña para avanzar',
        allowOutsideClick: false,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/sessions/resetPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      if (response.ok) {
        // Si la contraseña se reseteó correctamente, muestra un mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: data.message || 'Contraseña actualizada correctamente',
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/login'; // Redirige al login
          }
        });
      } else {
        // Si hay algún error, muestra un mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Error al resetear la contraseña',
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error inesperado. Por favor, inténtalo de nuevo más tarde.',
        allowOutsideClick: false,
      });
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
        <h2>Restablecer Contraseña</h2>
      <div className="form-group">
        <label htmlFor="password">Nueva Contraseña:</label>
        <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
        <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      <button type="submit" className="submit-button">Restablecer Contraseña</button>
    </form>
  );
}

export default FormResetPass;
