import React, { useState, useEffect, useContext } from 'react';
import UsersList from './UserList';
import Swal from 'sweetalert2';
import AuthContext from '../Contexts/AuthContext';

const UserListContainer = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user, setUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/users/?page=${currentPage}`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        credentials: 'include'
                    }
                });
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de usuarios');
                }
                
                const data = await response.json();
                setUsers(data.payload.users.docs);
                setTotalPages(Math.ceil(data.payload.totalDocs / 7)); // 16 es el límite por página
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchData();
    }, [currentPage]);

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

    const handleAcceptPremiumRequest = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/premium/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'accept' }), // Especifica la acción como 'accept'
                
            });
            
            if (response.ok) {
                // Si la respuesta es exitosa, muestra un mensaje de éxito utilizando Swal
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'La solicitud de premium ha sido aceptada correctamente.',
                });
                const updatedUser = await response.json()
                setUser(updatedUser)
            } else {
                // Si hay un error en la respuesta, muestra un mensaje de error utilizando Swal
                console.error('Error al aceptar la solicitud de premium');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al aceptar la solicitud de premium.',
                });
            }
        } catch (error) {
            // Si hay un error en la solicitud, muestra un mensaje de error utilizando Swal
            console.error('Error al aceptar la solicitud de premium:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al aceptar la solicitud de premium.',
            });
        }
    };
    
    const handleRejectPremiumRequest = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/premium/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'reject' }), // Especifica la acción como 'reject'
            });
            
            if (response.ok) {
                // Si la respuesta es exitosa, muestra un mensaje de éxito utilizando Swal
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'La solicitud de premium ha sido rechazada correctamente.',
                });
                const updatedUser = await response.json()
                setUser(updatedUser)
            } else {
                // Si hay un error en la respuesta, muestra un mensaje de error utilizando Swal
                console.error('Error al rechazar la solicitud de premium');
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al rechazar la solicitud de premium.',
                });
            }
        } catch (error) {
            // Si hay un error en la solicitud, muestra un mensaje de error utilizando Swal
            console.error('Error al rechazar la solicitud de premium:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al rechazar la solicitud de premium.',
            });
        }
    };

    return (
        <UsersList 
            users={users}
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
            setCurrentPage={setCurrentPage}
            handleAcceptPremiumRequest={handleAcceptPremiumRequest}
            handleRejectPremiumRequest={handleRejectPremiumRequest}
        />
    );
};

export default UserListContainer;