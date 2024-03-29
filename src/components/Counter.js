import React, { useContext } from 'react';
import useCounter from '../hooks/useCounter';
import { CartContext } from '../components/Contexts/CartContext';


const Counter = ({ initialValue = 1, stock, productId }) => {

    const { cart, updateCart } = useContext(CartContext);
    console.log(cart);
    const result = useCounter(initialValue);
    const handleIncrement = async () => {
        if (result.counter < stock) {
            result.increment();
            await updateQuantity(result.counter + 1);
        }
    };

    const handleDecrement = async () => {
        if (result.counter > 1) {
            result.decrement();
            await updateQuantity(result.counter - 1);
        }
    };

    const updateQuantity = async (newQuantity) => {
      try {
          const response = await fetch(`http://localhost:8080/api/carts/${cart._id}/products/${productId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ quantity: newQuantity }),
          });
          if (response.ok) {
              const updatedCart = await response.json();
              updateCart(updatedCart.payload);
          } else {
              console.error('Error al actualizar la cantidad en la base de datos:', response.statusText);
          }
      } catch (error) {
          console.error('Error al actualizar la cantidad en la base de datos:', error);
      }
  };

    return (
        <div className='count-container'>
            
            <button onClick={handleDecrement}>-</button>
            <p>{result.counter}</p>
            <button onClick={handleIncrement}>+</button>
            
        </div>
    );
};

export default Counter;
