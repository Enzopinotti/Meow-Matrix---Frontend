import React from 'react'
import Logo from '../components/Logo'
import FormRegister from '../components/Formularios/FormRegister'

const Register = () => {
  return (
    <main className='register-container'>
      <section className='register-sup'>

      </section>
      <video autoPlay loop muted className='video-background'>
          <source src='./video/fondo-register-2.mp4' type='video/mp4' />
      </video>

      <Logo />
      <FormRegister />
    </main>
  )
}

export default Register