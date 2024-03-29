import React, { useState, useEffect, useContext } from 'react';
import Cart from './Cart';
import AuthContext from '../Contexts/AuthContext';
import {CartContext} from '../Contexts/CartContext';


const CartContainer = () => {
    const { user } = useContext(AuthContext);
    const { cart, setCart, removeFromCart, removeAllFromCart, calculateTotalPrice, purchaseCart } = useContext(CartContext);
    useEffect(() => {
        console.log('entré')
        // Lógica para obtener el carrito del usuario
        const fetchCart = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/carts/current', {
                    method: 'GET',
                    credentials: 'include',
                });
                console.log('response: ', response)
                if (response.ok) {
                    const data = await response.json();
                    console.log('data: ', data.payload)
                    setCart(data.payload);
                } else {
                    console.error('Error fetching cart:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        };

        fetchCart();
    }, []);


    return <Cart cart={cart} removeFromCart={removeFromCart} removeAllFromCart={removeAllFromCart} user={user} calculateTotalPrice={calculateTotalPrice} purchaseCart={purchaseCart} />;
};

export default CartContainer;