import React, { useState, useEffect } from 'react';
import ProductDetail from './ProductDetail';
import { useParams, useNavigate } from 'react-router-dom'; // Importa useNavigate
import Swal from 'sweetalert2';

const ProductDetailContainer = () => {
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
        try {
            const response = await fetch(`http://localhost:8080/api/carts/product/${productId}`, {
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
                        // Navegar al carrito usando navigate
                        navigate('/cart');
                    } else {
                        // Navegar a la página de juegos usando navigate
                        navigate('/juegos');
                    }
                });
            } 
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
        }
    };
    
    return <ProductDetail product={product} addToCart={addToCart} />;
}

export default ProductDetailContainer;