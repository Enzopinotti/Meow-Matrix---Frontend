import React, { useState } from 'react'

const DarkMode = () => {

    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
        // Aquí actualizamos la clase del body para cambiar el tema de la aplicación
        const body = document.body;
        body.classList.toggle('theme-dark');
        body.classList.toggle('theme-light');
    };

    return (
        <div className="dark-mode-toggle" onClick={toggleDarkMode}>
            <input type="checkbox" className="checkbox" checked={darkMode} readOnly />
            <label className="slider" htmlFor="darkMode"></label>
        </div>
    )
}

export default DarkMode