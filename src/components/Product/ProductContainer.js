import React, { useContext } from 'react';
import Product from './Product';
import { isLiked } from '../../utils/ProductUtils';
import { AuthContext } from '../Contexts/AuthContext';
import Swal from 'sweetalert2';



const ProductContainer = ({ _id, thumbnails, name, stock, price }) => {
    const { user, setUser } = useContext(AuthContext);
    const handleFavoriteClick = async () => {
        try {
            if (user) {
                const response = await fetch(`http://localhost:8080/api/users/like/${_id}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Si necesitas enviar datos adicionales, puedes incluirlos aquí
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('result; ', result)
                    setUser(result.payload.newUser); 
                } else {
                    console.error('Error al realizar like/dislike:', response.statusText);
                }
            } else {
                console.log('Please log in to like the product');
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };
    
    const addToCart = async (_id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/carts/product/${_id}`, {
                method: 'POST',
                credentials: 'include', // Para enviar las cookies en la solicitud
            });
            if (response.ok) {
                // Producto agregado al carrito exitosamente
                Swal.fire({
                    title: 'Producto agregado al carrito',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Ir al carrito',
                    cancelButtonText: 'Seguir comprando',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirige al usuario al carrito
                        window.location.href = '/cart';
                    }else {
                        window.location.href = '/juegos';
                    }
                    
                });
            } 
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };

    return (
        <Product
            _id={_id}
            thumbnails={thumbnails}
            name={name}
            stock={stock}
            price={price}
            isProductLiked={user ? () => isLiked(user, _id) : () => false}
            handleFavoriteClick={handleFavoriteClick}
            addToCart={addToCart}
        />
    );
};

export default ProductContainer;
