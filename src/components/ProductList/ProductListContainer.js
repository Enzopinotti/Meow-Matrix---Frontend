import React, { useState, useEffect } from 'react';
import ProductList from './ProductList';

const ProductListContainer = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetch(`http://localhost:8080/api/products?page=${currentPage}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then((res) =>{
            if(!res.ok){
                throw Error(res.statusText);
            }
            if(res.status === 404){
                return Error('Not Found');
            }
            return res.json();
        })
        .then((data) =>{
            console.log('data: ', data)
            setProducts(data.payload.products.docs)
            setTotalPages(data.payload.products.totalPages);
        })
        .catch((error) =>{
            throw Error(error);
        })
        
    }, [currentPage]);

    const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage(currentPage - 1);
    };
    
    return <ProductList products={products} handleNextPage={handleNextPage} handlePrevPage={handlePrevPage} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />;
}

export default ProductListContainer;
