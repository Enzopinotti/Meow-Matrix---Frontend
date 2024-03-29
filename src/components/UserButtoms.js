import React from 'react'
import  { Link } from 'react-router-dom'



const UserButtoms = () => {
  return (
    <article className='user-buttoms'>
      <Link to='/login' className='link-login'>
        <img src='/img/default2.png' alt='icono de usuario' className='icon-user'></img>
        INGRESAR
      </Link>
      <Link to='/register' className='link-register'>REGISTRARSE</Link>
    </article>
  )
}

export default UserButtoms