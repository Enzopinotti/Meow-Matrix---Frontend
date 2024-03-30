import React, { useEffect, useState } from 'react';

const MyProducts = () => {
    // Aquí puedes manejar la lógica para obtener los productos del usuario premium
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Aquí puedes realizar una solicitud al servidor para obtener los productos del usuario premium
        // Por ejemplo:
        const fetchUserProducts = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/users/products/myProducts', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data); // Imprimir los datos en la consola para verificar que se reciben correctamente
                    setProducts(data.payload);
                } else {
                    console.error('Error fetching user products:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching user products:', error);
            }
        };

        fetchUserProducts();
    }, []);

    return (
        <div className="my-products-container">
            <section>
                <h1>Tus Productos</h1>
                <a href="/createProduct" className="create-btn">Crear Producto</a>
                <ul className="products-list">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <li key={product._id} className="product-item">
                                <h2 className="product-name">{product.name}</h2>
                                <p className="product-description">{product.description}</p>
                                <p className="product-price"><strong>Precio: </strong>${product.price}</p>
                                <p className="product-stock"><strong>Stock: </strong>{product.stock} unidades</p>
                                <p className="product-category"><strong>Categoría: </strong>{product.category.nameCategory}</p>
                                <img src={`img/${product.thumbnails}`} alt={product.name} className="product-img" />
                                {/* Agregar botones para editar y eliminar */}
                                <a href={`/products/${product._id}/edit`} className="edit-btn">Editar</a>
                                <button className="delete-btn" >Eliminar</button>
                            </li>
                        ))
                    ) : (
                        <h3 className="no-products">No hay Productos Para Mostrar</h3>
                    )}
                </ul>
            </section>
            
        </div>
    );
};

export default MyProducts;