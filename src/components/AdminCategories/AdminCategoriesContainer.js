import React, { useState, useEffect, useCallback } from 'react';
import AdminCategories from './AdminCategories';
import Swal from 'sweetalert2';

const AdminCategoriesContainer = () => {
    const [nameCategory, setNameCategory] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchCategories = useCallback(async () => {
        try {
            console.log('currentPage: ', currentPage);
            const response = await fetch(`http://localhost:8080/api/categories?page=${currentPage}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setCategories(data.payload.docs);
                setTotalPages(data.payload.totalPages);
            } else {
                throw new Error('Error al obtener las categorías');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un problema al cargar las categorías',
            });
        }
    }, [currentPage]);

    useEffect(() => {
        fetchCategories();
    }, [currentPage, fetchCategories]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const data = {
                nameCategory: nameCategory,
                description: description
            };
           
            const jsonData = JSON.stringify(data);
            const response = await fetch('http://localhost:8080/api/categories', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonData,
            });
            console.log(response);
            if (response.ok) {
                fetchCategories();
                setNameCategory('');
                setDescription('');
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Categoría agregada correctamente',
                });
            } else {
                throw new Error('Error al agregar la categoría');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un problema al agregar la categoría',
            });
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            console.log('id que envío: ', categoryId)
            const response = await fetch(`http://localhost:8080/api/categories/${categoryId}`, {
                method: 'DELETE',
            });
            console.log(await response.json())
            if (response.ok) {
                fetchCategories();
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Categoría eliminada correctamente',
                });
            } else {
                throw new Error('Error al eliminar la categoría');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un problema al eliminar la categoría',
            });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }
    return (
        <AdminCategories
            handleSubmit={handleSubmit}
            nameCategory={nameCategory}
            setNameCategory={setNameCategory}
            description={description}
            setDescription={setDescription}
            categories={categories}
            handleDeleteCategory={handleDeleteCategory}
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
            setCurrentPage={setCurrentPage}
        />
    );
};

export default AdminCategoriesContainer;
