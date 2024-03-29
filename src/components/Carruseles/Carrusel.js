import React, { useState } from 'react'
import SecondCarrusel from './SecondCarrusel';


const Carrusel = () => {

    const [backgroundIndex, setBackgroundIndex] = useState(0);

    const backgrounds = [
        './img/Contenedor_Fondo.jpg', 
        './img/fondo2.jpg', 
        './img/fondo3.jpg'
    ];


    const handleClickLeft = () => {
        setBackgroundIndex(prevIndex => (prevIndex === 0 ? backgrounds.length - 1 : prevIndex - 1));
    };

    const handleClickRight = () => {
        setBackgroundIndex(prevIndex => (prevIndex === backgrounds.length - 1 ? 0 : prevIndex + 1));
    };


    return (
        <div className="carrusel-wrapper" style={{ backgroundImage: `url(${backgrounds[backgroundIndex]})` }}>
            <article className='carrusel-container' >
                <img src='./img/controls/Flecha_Izquierda.png' alt="Flecha Izquierda" className="flecha-izquierda" onClick={handleClickLeft} />
                <div className="triangulo"></div>
                <img src='./img/controls/Flecha_Derecha.png' alt="Flecha Derecha" className="flecha-derecha" onClick={handleClickRight} />
            </article>
            <SecondCarrusel />
        </div>
    )
}

export default Carrusel