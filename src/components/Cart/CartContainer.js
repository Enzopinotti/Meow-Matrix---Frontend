import React, {  useEffect, useContext} from 'react';
import Cart from './Cart';
import AuthContext from '../Contexts/AuthContext';
import {CartContext} from '../Contexts/CartContext';
import Swal from 'sweetalert2';
import {  useNavigate } from 'react-router-dom';


const CartContainer = () => {
    const { user } = useContext(AuthContext);
    const { cart, setCart, removeFromCart, removeAllFromCart, calculateTotalPrice, purchaseCart } = useContext(CartContext);
    const navigate = useNavigate(); 
    
    
    useEffect(() => {
        if(user.rol === 'admin'){

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No tienes permisos para ver el carrito',
            }).then(() => {
                navigate('/')

            });
        }
    
        const fetchCart = async () => {
            try {
                const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/carts/current', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCart(data.payload);
                } else {
                    console.error('Error fetching cart:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        };

        fetchCart();
    }, [setCart, user.rol, navigate]);

    

    return <Cart cart={cart} removeFromCart={removeFromCart} removeAllFromCart={removeAllFromCart} user={user} calculateTotalPrice={calculateTotalPrice} purchaseCart={purchaseCart} />;
};

export default CartContainer;