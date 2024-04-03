import React, { useState } from 'react';
import Swal from 'sweetalert2';
import Logo from '../components/Logo';

const RecoveryPass = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email);
    if (email === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingresa un email',
        allowOutsideClick: false,
      });
      return;
    }

    try {
      const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/sessions/recoveryPass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (response.ok) {
        // Si el correo electrónico existe en la base de datos, mostrar un mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: data.error || 'Correo Enviado Correctamente',
          showConfirmButton: true,
          confirmButtonText: 'Ir al login',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/login';
          }
        });
      } else {
        // Si el usuario no existe, redirigir al registro
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'El usuario no existe, regístrate',
          allowOutsideClick: false,
          showConfirmButton: true,
          confirmButtonText: 'Ir al Registro', 
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = '/register';
          }
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
    <main className='recovery-container'>
      <section className='recovery-sup'></section>
      <video autoPlay loop muted className='video-background'>
          <source src='/video/fondo-register-2.mp4' type='video/mp4' />
      </video>
      <Logo />
      <div className="recovery-content">
       
        <form className="form-container" onSubmit={handleSubmit}>
          <h2>Recuperar Contraseña</h2>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" className="submit-button">Recuperar Contraseña</button>
        </form>
      </div>
    </main>
  );
}

export default RecoveryPass;