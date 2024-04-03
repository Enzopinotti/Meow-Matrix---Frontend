// AdminCategories.js
import React from 'react';
import FormCategories from '../Formularios/FormCategories';
import { Link } from 'react-router-dom';
import Pagination from '../Pagination';

const AdminCategories = ({ handleSubmit, nameCategory, setNameCategory, description, setDescription, categories, handleDeleteCategory, pageNumbers, currentPage, totalPages, handlePrevPage, handleNextPage, setCurrentPage }) => {
    return (
        <main className="admin-container">
            <FormCategories handleSubmit={handleSubmit} nameCategory={nameCategory} setNameCategory={setNameCategory} description={description} setDescription={setDescription} />
            <section className="product-list-section">
                <Link to="/realTimeProducts" className="botonNavegacion">Administrar Productos</Link> 
                <h2 className="section-title">Lista de Categorías</h2>
                <ul className="product-list-admin">
                    {categories.map((category) => (
                        <li key={category._id} data-category-id={category._id}>
                            <h3>{category.nameCategory}</h3>
                            <p>{category.description}</p>
                            <button className="delete-button" onClick={() => handleDeleteCategory(category._id)}>Eliminar</button>
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

export default AdminCategories;
