import React from 'react';
import Swal from 'sweetalert2';
import { formatPrice } from '../../utils/ProductUtils';
import Counter from '../Counter';
import { useNavigate } from 'react-router-dom';

const Cart = ({ cart, removeFromCart, removeAllFromCart, user, calculateTotalPrice, purchaseCart}) => {
    const navigate = useNavigate();

    

    if (user === null) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Debes iniciar sesión o registrarte para acceder al carrito.',
            showCancelButton: true,
            cancelButtonText: 'Registrarse',
            confirmButtonText: 'Iniciar sesión',
            allowOutsideClick: () => !Swal.isLoading(), // Permitir clic afuera si no se está cargando
            willClose: () => {
                navigate('/');
            }
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/login');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                navigate('/register');
            }
        });
        return <div className="cart-empty"></div>;
    }
    if (cart === undefined || cart === null) {
        return (
            <div className="empty-cart">
                <h2>Tu Carrito Está Vacío</h2>
                <img src="img/gatito_carrito.png" alt="Carrito vacío" />
            </div>
        )
    }else{
        return (
            <div className="cart-container">
                {cart.products.length > 0 ? (
                    <>
                        <ul className="cart-list">
                            <li className="cart-item cart-header">
                                <section>
                                    <p></p>
                                </section>
                                <section>
                                    <p>Nombre</p>
                                </section>
                                <section>
                                    <p>Cantidad</p>
                                </section>
                                <section>
                                    <p>Precio</p>
                                </section>
                                <section>
                                    <p></p>
                                </section>
                            </li>
                            {cart.products.map((item) => (
                                <li key={item.product._id} className="cart-item">
                                    <section>
                                        <img src={`https://meowmatrix-backend-2v-production.up.railway.app/${item.product.thumbnails[0]}`} alt={item.product.name} className="product-img" />
                                    </section>
                                    <section>
                                        <p className="product-name">{item.product.name}</p>
                                    </section>
                                    <section>
                                        <Counter initialValue={item.quantity} stock={item.product.stock} productId={item.product._id} />
                                    </section>
                                    <section>
                                        <p className="product-price">${formatPrice(item.product.price * item.quantity)}</p>
                                    </section>
                                    <section>
                                        <form className="remove-from-cart-form">
                                            <input type="hidden" name="_method" value="DELETE" />
                                            <button type="button" className="remove-from-cart-btn" onClick={() => removeFromCart(item.product._id)}>Eliminar del carrito</button>
                                        </form>
                                    </section>
                                </li>
                            ))}
                        </ul>
                        <div id="cart-summary" className="cart-summary">
                            <p className="total-items">Total de productos: {cart.products.length}</p>
                            <p className="total-price">Total a pagar: ${calculateTotalPrice()}</p>
                            <div className="delete-button">
                                <button type="button" className="remove-all-from-cart-btn" onClick={removeAllFromCart}>Eliminar todo del carrito</button>
                            </div>
                            <div className="checkout-container">
                                <button onClick={purchaseCart} className="checkout-btn">Finalizar Compra</button>
                            </div>
                        </div>
                    </>
                ) : (
                    // Mostrar mensaje de carrito vacío
                    <div className="empty-cart">
                        <h2>Tu Carrito Está Vacío</h2>
                        <img src="img/gatito_carrito.png" alt="Carrito vacío" />
                    </div>
                )}
            </div>
        );
    }
    
};

export default Cart;
