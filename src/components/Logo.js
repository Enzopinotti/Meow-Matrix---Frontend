import React from 'react'

import { NavLink } from 'react-router-dom'
const Logo = () => {
  return (
    <article className='logo-container'>
        <NavLink to='/'><img src='./img/Logo.png' alt='logo' className="logo-img" /></NavLink>
    </article>
  )
}

export default Logo