export const checkStock = (stock) => {
    return stock > 0;
};

export const formatPrice = (price) => {
    // Verifica si el precio es un número
    if (typeof price !== 'number') {
        return '';
    }

    // Formatea el precio con separadores de miles y sin decimales
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatDate = (date) => {
    if (!date || !(date instanceof Date)) {
        return '';
    }
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`
    return formattedDate;
};

export const isLiked = (user, productId) => {
    const likes = user.likes || []; // Obtiene los likes del usuario o un array vacío si no hay likes.
    return likes.includes(productId);
};