import React from 'react';
import ProductContainer from '../Product/ProductContainer';
import Pagination from '../Pagination';
const ProductList = ({ products, currentPage, totalPages, handleNextPage, handlePrevPage, setCurrentPage }) => {
    
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    
    
    return (
        <main className='main-container'>
            <ul className='product-list'>
            {   products.map(product => <ProductContainer key={product._id} {...product} />)   }
            </ul>
            <Pagination pageNumbers={pageNumbers} currentPage={currentPage} setCurrentPage={setCurrentPage} handleNextPage={handleNextPage} handlePrevPage={handlePrevPage} totalPages={totalPages}  />
        </main>
       
    );
}

export default ProductList;
