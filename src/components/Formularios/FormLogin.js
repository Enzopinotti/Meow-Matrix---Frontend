import React, {  useContext, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext'

const FormLogin = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email === '' && password === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, completa todos los campos',
            allowOutsideClick: false,
        });
        return;
    }else if (email === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, completa el campo email para avanzar',
            allowOutsideClick: false,
        });
        return;
    }
    else if (password === '') {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, completa el campo contraseña para avanzar',
            allowOutsideClick: false,
        });
        return;
    }
    
    await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/sessions/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    .then(async (result) => {
      
      if (result.ok) {
        // Actualiza el estado del usuario utilizando setUser del contexto
        navigate('/');
        Swal.fire({
          icon: 'success',
          title: '¡Inicio de sesión exitoso!',
          text: 'Bienvenido de nuevo',
          allowOutsideClick: false,
        });
      }
      if (result.status === 401) {
          throw new Error('Credenciales incorrectas');
      }
      return result.json();
    })
    .then(json => {
      const userData = json.payload;
      console.log('userDataLogin: ', userData)
      setUser(userData);
    })
    .catch(error => {
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Error inesperado',
          allowOutsideClick: false,
      });
  });
    
  };
  
  return (
    <section className='login-form'>
      <div className="login-content">
        <h2 className="text-login">Inicia sesión</h2>
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <Link to="/recoveryPass" id='link_recovery'><span className="forgot-password">¿Olvidaste tu contraseña?</span></Link>
          </div>
          <button type="submit" className="submit-button">Iniciar sesión</button>
          <Link to='/register'><button className="register-button">Registrarse</button></Link>
        </form>
      </div>
    </section>
  );
}

export default FormLogin;