import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/ProductUtils';

const MisLikes = () => {
    const [favoritos, setFavoritos] = useState([]);

    const handleRemoveFavorite = async (_id) => {
        try {
            const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/users/like/remove/${_id}`, {
                method: 'DELETE',
                credentials: 'include', // Esto asegura que se envíen las cookies en la solicitud
            });
            console.log(response);
            if (response.ok) {
                // Eliminar el producto de la lista de favoritos localmente
                setFavoritos(prevFavoritos => prevFavoritos.filter(favorito => favorito._id.toString() !== _id));
                console.log(`Producto ${_id} eliminado de favoritos`);
            } else {
                console.error('Error al eliminar el producto de favoritos:', response.statusText);
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };

    useEffect(() => {
        const obtenerFavoritos = async () => {
            try {
                const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/users/likes', {
                    method: 'GET',
                    credentials: 'include', // Esto asegura que se envíen las cookies en la solicitud
                });
                if (response.ok) {
                    const data = await response.json();
                    setFavoritos(data.payload);
                } else {
                    console.error('Error al obtener los favoritos del usuario:', response.statusText);
                }
            } catch (error) {
                console.error('Error al realizar la solicitud:', error);
            }
        };

        obtenerFavoritos();
    }, []);

    if (favoritos.length === 0) {
        
        return (
            <div className='likes-container'>
                <h2>Mis Favoritos</h2>
                <p>Aún no tienes likes, agregá algún producto.</p>
                <img src="./img/gato_sin_like.png" alt="Empty likes" className='empty-likes-img'/>
            </div>
        )
    }else{
        return (
            <div className='likes-container'>
                <h2>Mis Favoritos</h2>
                <ul>
                    {favoritos.map((favorito) => (
                        <li key={favorito._id} className="card">
                            <header className="product-header">
                                <button className="remove-favorite" onClick={() => handleRemoveFavorite(favorito._id)}>
                                    <img src="./img/remove.png" alt="Remove" className="remove-img" />
                                </button>
                            </header>
                            <Link to={`/products/${favorito._id}`}><img src={`https://meowmatrix-backend-2v-production.up.railway.app/${favorito.thumbnails[0]}`} alt={favorito.name} className='img-like'/></Link>
                            <strong><p>{favorito.name}</p></strong>
                            <div className="price-info">
                                <p className="favorite-price">${formatPrice(favorito.price)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

   
};

export default MisLikes;