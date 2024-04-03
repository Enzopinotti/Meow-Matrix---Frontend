import React, { createContext, useState } from 'react';
import { formatPrice } from '../../utils/ProductUtils';
import Swal from 'sweetalert2';

export const CartContext = createContext();


export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);

    const updateCart = (newCart) => {
        setCart(newCart);
    };

    const calculateTotalPrice = () => {
        if (!cart || !cart.products || cart.products.length === 0) {
            return 0; // Si el carrito está vacío, el precio total es cero
        }

        let totalPrice = 0;
        cart.products.forEach((item) => {
            totalPrice += item.product.price * item.quantity;
        });
        return formatPrice(totalPrice);
    };


    const removeFromCart = async (productId) => {
        if (!cart || !cart.products || cart.products.length === 0) {
            return;
        }

        const updatedProducts = cart.products.filter((item) => item.product._id !== productId);
        setCart({ ...cart, products: updatedProducts });

        try {
            const response = await fetch(`http://localhost:8080/api/carts/${cart._id}/product/${productId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Error al eliminar el producto del carrito');
            }
        } catch (error) {
            console.error('Error al eliminar el producto del carrito:', error);
            // Manejar el error según sea necesario
        }

    };

    const removeAllFromCart = async () => {
        if (!cart || !cart.products || cart.products.length === 0) {
            return;
        }

        setCart({ ...cart, products: [] });

        try {
            const response = await fetch(`http://localhost:8080/api/carts/${cart._id}/products`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Error al eliminar todos los productos del carrito');
            }
        } catch (error) {
            console.error('Error al eliminar todos los productos del carrito:', error);
            // Manejar el error según sea necesario
        }
    };

    const purchaseCart = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/carts/${cart._id}/purchase`, {
                method: 'GET',
                credentials: 'include',
            });
            console.log('response de compra: ', response)
            if (response.ok) {
                // Proceso de compra exitoso
                const serverUrl = window.location.origin;
                console.log('serverUrl: ', serverUrl)
                Swal.fire({
                    icon: 'success',
                    title: 'Compra exitosa',
                    text: 'Tu compra se ha realizado correctamente. Te redireccionaremos a la página de ticket.',
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
                window.location.href = `${serverUrl}/ticket`;
                

            } else {
                // Proceso de compra fallido
                const data = await response.json();
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error al realizar la compra:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al procesar tu compra. Por favor, inténtalo de nuevo más tarde.',
            });
        }
    };

    const getTicketDetails = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/carts/ticket`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const tickets = await response.json();
                if (Array.isArray(tickets.payload) && tickets.payload.length > 0) {
                    const latestTicket = tickets.payload[tickets.payload.length - 1];
                    return latestTicket;
                } else {
                    throw new Error('No se encontraron tickets para este usuario');
                }
            } else {
                throw new Error('Error al obtener los detalles del ticket');
            }
        } catch (error) {
            console.error('Error al obtener los detalles del ticket:', error.message);
            throw error;
        }
    };

    const value = {
        cart,
        setCart,
        updateCart,
        calculateTotalPrice,
        removeFromCart,
        removeAllFromCart,
        purchaseCart,
        getTicketDetails,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};