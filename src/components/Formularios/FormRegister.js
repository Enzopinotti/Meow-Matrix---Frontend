import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const FormRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: '',
    phone: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verifica si algún campo está vacío
    for (const key in formData) {
      if (formData[key] === '') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Por favor, completa el campo ${key}`,
          allowOutsideClick: false,
        });
        return;
      }
    }

    try {
      const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/sessions/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        // Redirige al usuario a la página de inicio de sesión después del registro exitoso
        navigate('/login');
        // Muestra un mensaje de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Bienvenid@ a Nuestra Comunidad 💕',
          allowOutsideClick: false,
        });
      } else {
        const data = await response.json();
        // Muestra un mensaje de error si ocurre un error durante el registro
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Error inesperado',
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Muestra un mensaje de error genérico si hay un problema con la solicitud
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error inesperado. Por favor, inténtalo de nuevo más tarde.',
        allowOutsideClick: false,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className='register-form'>
      <div className="register-content">
        <h2 className="text-register">Registrarse</h2>
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre/s:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Apellido/s:</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
            <span className="password-requirements">La contraseña debe tener al menos una minúscula, una mayúscula, un número y tener una longitud de al menos 6 caracteres.</span>
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">Fecha de Nacimiento:</label>
            <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Teléfono:</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <button type="submit" className="submit-button">Registrarse</button>
          <Link to='/login'><button className="register-button">Iniciar Sesión</button></Link>
        </form>
      </div>
    </section>
  );
}

export default FormRegister;
