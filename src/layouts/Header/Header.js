import { useLocation } from 'react-router-dom';
import BarraBusqueda from "../../components/BarraBusqueda";
import DarkMode from "../../components/DarkMode";
import Nav from "../../components/Nav";
import UserButtoms from "../../components/UserButtoms";
import CartButtom from "../../components/buttoms/CartButtom";
import LikeButtom from "../../components/buttoms/LikeButtom";
import UserProfileDropdown from '../../components/UserProfileDropdown ';
import { AuthContext } from '../../components/Contexts/AuthContext';
import { useContext, useState } from 'react';

const Header = () => {
    // Obtener la ubicación actual
    const { user, setUser } = useContext(AuthContext);
    const location = useLocation();
    // Determinar si debemos renderizar los componentes en el Header
    const shouldRenderComponents = () => {
        return !(location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/recoveryPass' || location.pathname.startsWith('/resetPassword/'));
    };

    if (!shouldRenderComponents()) {
        return null;
    }


    // Renderizar el componente del header con el usuario disponible
    return (
        <header className="header-container">
            <section className="header-sup">
                <BarraBusqueda />
                <CartButtom user={user}/>
                <LikeButtom user={user}/>
                {user ? (
                    <UserProfileDropdown user={user} setUser={setUser}/> // Utiliza el componente UserProfileDropdown si el usuario está logeado
                ) : (
                    <UserButtoms />
                )}
                <DarkMode />
            </section>
            <Nav />

        </header>
    );
}

export default Header;
