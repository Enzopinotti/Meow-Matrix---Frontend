import React, { useState, useEffect, useContext } from 'react';
import ProductDetail from './ProductDetail';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import Swal from 'sweetalert2';
import AuthContext from '../Contexts/AuthContext';

const ProductDetailContainer = () => {
    const { user } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const { id } = useParams(); // Importa useParams para obtener el parámetro de la URL
    const navigate = useNavigate(); // Usa useNavigate para la navegación

    useEffect(() => {
        // Lógica para obtener los detalles del producto con el ID obtenido
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/products/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCart = async (productId) => {
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
            const response = await fetch(`http://localhost:8080/api/carts/product/${productId}`, {
                method: 'POST',
                credentials: 'include', // Para enviar las cookies en la solicitud
            });
            const data = await response.json();
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
                        // Navegar al carrito usando navigate
                        navigate('/cart');
                    } else {
                        // Navegar a la página de juegos usando navigate
                        navigate('/products');
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
    
    return <ProductDetail product={product} addToCart={addToCart} />;
}

export default ProductDetailContainer;