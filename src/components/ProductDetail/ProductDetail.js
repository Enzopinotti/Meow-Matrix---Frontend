import React from 'react';
import { formatPrice } from '../../utils/ProductUtils';

const ProductDetail = ({ product, addToCart }) => {
    if (!product) {
        return <div className="product-detail-loading">Cargando...</div>; 
    }
    const handleAddToCart = () => {
        addToCart(_id);
    };
    const { _id, name, description, price, thumbnails } = product.payload;

    return (
        <div className="product-detail-container">
            <img src={`/img/products/${thumbnails}`} alt={name} className="product-detail-image" />
            <div className="product-detail-content">
                <h2 className="product-detail-name">{name}</h2>
                <p className="product-detail-description">{description}</p>
                <p className="product-detail-price">Precio: ${formatPrice(price)}</p>
                <button className="product-detail-add-to-cart" onClick={handleAddToCart}>Agregar al carrito</button>
            </div>
        </div>
    );
}

export default ProductDetail;
