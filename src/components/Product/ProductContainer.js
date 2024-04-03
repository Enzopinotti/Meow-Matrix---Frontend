import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Product from './Product';
import { isLiked } from '../../utils/ProductUtils';
import { AuthContext } from '../Contexts/AuthContext';
import Swal from 'sweetalert2';

const ProductContainer = ({ _id, thumbnails, name, stock, price }) => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate(); 

    const handleFavoriteClick = async () => {
        try {
            if (user) {
                const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/users/like/${_id}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log('result; ', result)
                    setUser(result.payload.newUser); 
                } else {
                    console.error('Error al realizar like/dislike:', response.statusText);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Debes iniciar sesión o registrarte para poder dar Likes.',
                    showCancelButton: true,
                    cancelButtonText: 'Registrarse',
                    confirmButtonText: 'Iniciar sesión'
                }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/login');
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            navigate('/register');
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };
    
    const addToCart = async (_id) => {
        if (!user) {
            // Si el usuario no está autenticado, muestra un SweetAlert con dos botones para redirigirlo a /login o /register
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Debes iniciar sesión o registrarte para agregar un Producto al Carrito.',
              showCancelButton: true,
              cancelButtonText: 'Registrarse',
              confirmButtonText: 'Iniciar sesión'
            }).then((result) => {
              if (result.isConfirmed) {
                navigate('/login');
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                navigate('/register');
              }
            });
            return;
        }
        try {
            const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/carts/product/${_id}`, {
                method: 'POST',
                credentials: 'include',
            });

            console.log('response: ', response)
            const data = await response.json();
            console.log('data: ', data)
            if (response.ok) {
                Swal.fire({
                    title: 'Producto agregado al carrito',
                    text: '¿Desea ir al carrito o continuar comprando?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Ir al carrito',
                    cancelButtonText: 'Seguir comprando',
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate('/cart'); // Usa navigate para redirigir al carrito
                    } else {
                        navigate('/products'); // Usa navigate para redirigir a la página de juegos
                    }
                });
            }

            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.error,
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
