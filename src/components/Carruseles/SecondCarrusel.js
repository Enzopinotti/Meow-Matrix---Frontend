import React, { useState } from 'react';

const SecondCarrusel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const genres = [
        { id: 1, name: "Acción", image: "./img/genders/Accion.png" },
        { id: 2, name: "Aventura", image: "./img/genders/Aventura.png" },
        { id: 3, name: "Puzzle", image: "./img/genders/Puzzle.png" },
        { id: 4, name: "Plataformas", image: "./img/genders/Plataformas.png" },
        { id: 5, name: "Deportes", image: "./img/genders/Deportes.png" },
        { id: 6, name: "Carreras", image: "./img/genders/Carreras.png" },
        { id: 7, name: "RPG", image: "./img/genders/RPG.png" },
        { id: 8, name: "Simulación", image: "./img/genders/Simulacion.png" }
    ];

    // Dividir el array de géneros en subarrays de cuatro elementos cada uno
    const chunkedGenres = genres.reduce((resultArray, item, index) => { 
        const chunkIndex = Math.floor(index / 4); 
        
        if (!resultArray[chunkIndex]) { 
            resultArray[chunkIndex] = []; 
        }
        
        resultArray[chunkIndex].push(item); 
        
        return resultArray;
    }, []);



    const handleClickLeft = () => {
        setCurrentIndex(prevIndex => (prevIndex === 0 ? chunkedGenres.length - 1 : prevIndex - 1));
    };

    const handleClickRight = () => {
        setCurrentIndex(prevIndex => (prevIndex === chunkedGenres.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <div className="second-carrusel">

                <img
                    src="./img/controls/Flecha_izq_generos.png"
                    alt="Flecha Izquierda"
                    className="second-carrusel-arrow"
                    onClick={handleClickLeft}
                />
                <div className="second-carrusel-row">
                    {chunkedGenres[currentIndex].map(genre => (
                        <div key={genre.id} className="second-carrusel-card" style={{ backgroundImage: `url(${genre.image})` }}>
                            <div className="second-carrusel-overlay">
                                <h3 className='genre-name'>{genre.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                <img
                    src="./img/controls/Flecha_der_generos.png"
                    alt="Flecha Derecha"
                    className="second-carrusel-arrow"
                    onClick={handleClickRight}
                />

        </div>
    );
};

export default SecondCarrusel;