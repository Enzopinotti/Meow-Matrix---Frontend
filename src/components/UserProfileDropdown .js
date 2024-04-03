import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserProfileDropdown = (props) => {
    const { user, setUser } = props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleImageClick = (e) => {
        e.stopPropagation(); // Evitar la propagación del evento click
        toggleDropdown();
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/sessions/logout', {
                method: 'GET',
                credentials: 'include', // Para enviar las cookies en la solicitud
            });
            console.log('respuesta del logout: ',response);
            if (response.ok) {
                // Eliminar cualquier estado de usuario almacenado localmente
                // Redirigir al usuario a la página de inicio de sesión
                navigate('/login');
                document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                setUser(null);

            } else {
                console.error('Error al cerrar sesión:', response.statusText);
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };
    if (user.avatar === undefined) {
        user.avatar = '/img/default2.png';
    }
    const imageUrl = `http://localhost:8080/${user.avatar}`;
    return (
        <div className="user-profile">
            <img src={imageUrl} alt="Perfil" className="profile-image" onClick={handleImageClick} />
            {dropdownOpen && (
                <ul className="profile-dropdown" ref={dropdownRef}>
                    <li><Link to="/profile">Perfil</Link></li>
                    <li onClick={handleLogout}>Cerrar sesión</li>
                </ul>
            )}
        </div>
    );
}

export default UserProfileDropdown;
