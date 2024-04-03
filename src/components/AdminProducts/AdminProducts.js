import React from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';
import FormProducts from '../Formularios/FormProducts';

const AdminProducts = ( {handleSubmit, productName, setProductName, productDescription, setProductDescription, productPrice, setProductPrice, productCode, setProductCode, productStock, setProductStock, productCategory, setProductCategory, categories, handleFileChange, products, pageNumbers, currentPage, totalPages, handlePrevPage, handleNextPage, setCurrentPage, handleDeleteProduct }) => {
    
    return (
      <main className="admin-container">
        <FormProducts 
          handleSubmit={handleSubmit}
          productName={productName}
          setProductName={setProductName}
          productDescription={productDescription}
          setProductDescription={setProductDescription}
          productPrice={productPrice}
          setProductPrice={setProductPrice}
          productCode={productCode}
          setProductCode={setProductCode}
          productStock={productStock}
          setProductStock={setProductStock}
          productCategory={productCategory}
          setProductCategory={setProductCategory}
          categories={categories}
          handleFileChange={handleFileChange}       
        />
        <section className="product-list-section">
          <Link to="/realTimeCategories" className="botonNavegacion">Administrar Categorías</Link>  
          <h2 className="section-title">Lista de Productos</h2>
          <ul className="product-list-admin" id="productList">
            {products.map((product) => (
              
            <li key={product._id} data-product-id={product._id}>
              <h3>{product.name}</h3>
              <img src={`https://meowmatrix-backend-2v-production.up.railway.app${product.thumbnails[0]}`} alt={product.name} className="product-image" />
              <p>{product.description}</p>
              <p><strong>Precio:</strong> ${product.price}</p>
              <p><strong>Stock:</strong> {product.stock} unidades</p>
              <p><strong>Categoría:</strong> {product.category}</p>
              <button className="delete-button" data-product-id={product._id} onClick={() => handleDeleteProduct(product._id)}>Eliminar</button>
            </li>
            ))}
          </ul>
          <Pagination
                pageNumbers={pageNumbers}
                currentPage={currentPage}
                totalPages={totalPages}
                handlePrevPage={handlePrevPage}
                handleNextPage={handleNextPage}
                setCurrentPage={setCurrentPage}
            />
        </section>
      </main>
    
    );
};

export default AdminProducts;
