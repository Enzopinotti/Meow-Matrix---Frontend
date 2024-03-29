import React from 'react';
import { checkStock, formatPrice } from '../../utils/ProductUtils';
import { Link } from 'react-router-dom';

const Product = ({ _id, thumbnails, name, stock, price, isProductLiked, handleFavoriteClick, addToCart }) => {

    const handleAddToCart = () => {
        addToCart(_id);
    };

    return (
        <li className="product-item">
            <header className="product-header">
                {isProductLiked() ? (
                    
                    <button id={`favoriteButton-${_id}`} className="favorite-button" aria-label="Marcar como favorito" onClick={handleFavoriteClick}>
                        <img src="./img/like_relleno.png" alt="like_relleno" className="like_img" />
                    </button>
                ) : (
                    
                    <img src="./img/like_sin_relleno.png" alt="like_sin_relleno" className="like_img" onClick={handleFavoriteClick} ></img>
                )}
            </header>
            <section className="product-info">
                <Link to={`/juegos/${_id}`}><img src={`./img/products/${thumbnails}`} alt={name} className="product-img" /></Link>
                <span className={`stock-status ${checkStock(stock) ? '' : 'out-of-stock'}`}>{checkStock(stock) ? 'En Stock' : 'Sin Stock'}</span>
                <h2 className="product-name">{name}</h2>
                <div className="price-info">
                    <p className="product-price">${formatPrice(price)}</p>
                </div>
            </section>
            <button className="add-to-cart-button" onClick={handleAddToCart}>Agregar al carrito</button>
        </li>
    );
};

export default Product;
