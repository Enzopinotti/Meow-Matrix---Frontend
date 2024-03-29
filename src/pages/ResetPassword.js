import React from 'react';
import { useParams } from 'react-router-dom';
import Logo from '../components/Logo';
import FormResetPass from '../components/Formularios/FormResetPass';

const ResetPassword = () => {
  const { token } = useParams();

  return (
    <main className='recovery-container'>
      <section className='recovery-sup'></section>
      <video autoPlay loop muted className='video-background'>
          <source src='/video/fondo-login-2.mp4' type='video/mp4' />
      </video>
      <Logo />
      <div className="recovery-content">
        
        <FormResetPass token={token} />
      </div>
    </main>
  );
}

export default ResetPassword;