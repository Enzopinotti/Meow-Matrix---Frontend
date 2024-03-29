import React from 'react'
import Logo from '../components/Logo'
import FormLogin from '../components/Formularios/FormLogin'

const Login = () => {
  return (
      <main className='login-container'>
        <section className='login-sup'>

        </section>
        <video autoPlay loop muted className='video-background'>
          <source src='./video/fondo-login-2.mp4' type='video/mp4' />
        </video>
        <Logo />
        <FormLogin />
        <p className='text-login'>Al iniciar sesión, estás aceptando nuestros <strong>Términos y Condiciones</strong> y nuestra política sobre <strong>Protección de Datos</strong>.</p>
      </main>
  )
}

export default Login