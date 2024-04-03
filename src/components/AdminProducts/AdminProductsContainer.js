import React, { useState, useEffect, useCallback } from 'react';
import AdminProducts from './AdminProducts';
import Swal from 'sweetalert2';

const AdminProductsContainer = () => {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productCode, setProductCode] = useState('');
    const [productStock, setProductStock] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchRealTimeProducts = useCallback(async () => {
        try {
            const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/products?page=${currentPage}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.payload.products.docs);
                setTotalPages(data.payload.products.totalPages);
            } else {
                throw new Error('Error al obtener los productos en tiempo real');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un problema al cargar los productos en tiempo real',
            });
        }
    }, [currentPage]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.payload.docs);
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
        };

        // Aquí puedes realizar una solicitud para obtener las categorías disponibles
        fetchCategories();
        // También puedes cargar los productos en tiempo real
        fetchRealTimeProducts();
    }, [currentPage, fetchRealTimeProducts]);

    const handleFileChange = (event) => {
        setProductImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', productName);
            formData.append('description', productDescription);
            formData.append('price', productPrice);
            formData.append('code', productCode);
            formData.append('stock', productStock);
            formData.append('category', productCategory);
            formData.append('productImage', productImage); // Asegúrate de que el nombre del campo coincida con el que espera el servidor
    
            const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/products', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
    
            if (response.ok) {
                // Refrescar la lista de productos después de agregar uno nuevo
                fetchRealTimeProducts();
                // Restablecer los campos del formulario
                setProductName('');
                setProductDescription('');
                setProductPrice('');
                setProductCode('');
                setProductStock('');
                setProductCategory('');
                setProductImage(null);
                // Mostrar una notificación de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Producto agregado correctamente',
                });
            } else {
                throw new Error('Error al agregar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            // Manejar el error con SweetAlert u otra biblioteca de notificación
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un problema al agregar el producto',
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

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/products/${productId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Refrescar la lista de productos después de eliminar uno
                fetchRealTimeProducts();
                // Mostrar una notificación de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Producto eliminado correctamente',
                });
            } else {
                throw new Error('Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            // Manejar el error con SweetAlert u otra biblioteca de notificación
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Hubo un problema al eliminar el producto',
            });
        }
    };

  return (
    <AdminProducts 
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
        products={products}
        handleFileChange={handleFileChange}
        pageNumbers={pageNumbers}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleDeleteProduct={handleDeleteProduct}
    />
  )
}

export default AdminProductsContainer