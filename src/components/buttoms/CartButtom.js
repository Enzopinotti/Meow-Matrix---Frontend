import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CartButtom = ({ user }) => {
  const navigate = useNavigate();

  const handleCartButtonClick = () => {
    if (!user) {
      // Si el usuario no está autenticado, muestra un SweetAlert con dos botones para redirigirlo a /login o /register
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes iniciar sesión o registrarte para acceder al carrito.',
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
    }
  };

  // Si el usuario está autenticado, el enlace funciona como de costumbre
  if (user) {
    return (
      <Link to={'./cart'} className="cart-button"><img alt='carrito_icono'  src='./img/icons/carrito.png' className='img-cart-button'></img></Link>
    );
  }

  // Si el usuario no está autenticado, se muestra un botón sin enlace, y se maneja el evento onClick manualmente
  return (

    <div className="cart-button">
        <img alt='carrito_icono' src='./img/icons/carrito.png' className='img-cart-button' onClick={handleCartButtonClick}></img>
    </div>
    
    
  );
};

export default CartButtom;
