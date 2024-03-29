import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LikeButtom = ({ onAuthPopup, user }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const handleCartButtonClick = () => {
    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debes iniciar sesión o registrarte para acceder a los likes.',
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
    }else{
      handleNavigateToProfile()
    }
  };

  const handleNavigateToProfile = () => {
      const { pathname, search } = location;
      const isProfilePath = pathname.includes('/profile');

      if (isProfilePath) {
          navigate(`${pathname}${search}&selectedButton=mis-favoritos`);
      } else {
          navigate(`/profile?selectedButton=mis-favoritos`);
      }
  };

  return (
    <div className="likes-buttom" onClick={handleCartButtonClick}>
        <img alt='corazon_likes' src='./img/icons/corazon.png' className='img-cart-button'></img>
    </div>
  )
}

export default LikeButtom