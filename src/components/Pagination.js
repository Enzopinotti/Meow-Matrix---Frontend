import React from 'react'

const Pagination = ( { pageNumbers, currentPage, handlePrevPage, totalPages, setCurrentPage, handleNextPage } ) => {

    const handlePrevClick = () => {
        if (currentPage > 1) {
            handlePrevPage();
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            handleNextPage();
            setCurrentPage(currentPage + 1);
        }
    };


    return (

        
        <div className='product-pagination'>
            <img src='/img/controls/Flecha_izq_generos.png' onClick={handlePrevClick} className={currentPage === 1 ? 'disabled' : ''}></img>
            <div className="page-numbers">
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        className={number === currentPage ? 'current-page' : ''}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </button>
                ))}
            </div>
            <img src='/img/controls/Flecha_der_generos.png' onClick={handleNextClick} className={currentPage === totalPages ? 'disabled' : ''}></img>
        </div>
    )
}

export default Pagination