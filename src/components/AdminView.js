import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserListContainer from './UserList/UserListContainer';

const AdminView = () => {
    // Aquí puedes agregar la lógica necesaria para administrar productos y categorías, así como la lista de usuarios
    return (
        <section className="admin-view">
            <section className="admin-buttons">
                <Link to="/realTimeProducts" className="admin-button">Administrar Productos</Link>
                <Link to="/realTimeCategories" className="admin-button">Administrar Categorías</Link>
                <Link to="/registerAdmin" className="admin-button">Registrar Administrador</Link>
            </section>
            {/* Aquí puedes agregar la lista de usuarios */}
            <UserListContainer />
            <section className="pagination">
                {/* Lógica para la paginación */}
            </section>
        </section>
    );
};

export default AdminView;