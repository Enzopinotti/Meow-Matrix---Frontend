import React from 'react'
import Logo from './Logo'
import { NavLink } from 'react-router-dom'
const Nav = () => {
  return (
    <div className='header-nav'>
        <Logo />
        <ul className="nav-list">
            <NavLink to='/juegos'><li>Juegos</li></NavLink>
            <NavLink to='/categories'><li>Categorías</li></NavLink>
            <NavLink to='/sobreNosotros'><li>Sobre Nosotros</li></NavLink>
            <NavLink to='/contacto'><li>Contacto</li></NavLink>
        </ul>
    </div>
  )
}

export default Nav