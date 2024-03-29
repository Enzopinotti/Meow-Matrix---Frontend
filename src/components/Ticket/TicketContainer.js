import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../Contexts/CartContext';
import Ticket from './Ticket';
import Swal from 'sweetalert2';

const TicketContainer = () => {
    const [ticketDetails, setTicketDetails] = useState(null);
    const { getTicketDetails } = useContext(CartContext);

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const ticket = await getTicketDetails();
                setTicketDetails(ticket);
            } catch (error) {
                console.error('Error al obtener los detalles del ticket:', error.message);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al obtener los detalles del ticket. Por favor, inténtalo de nuevo más tarde.',
                });
            }
        };
        fetchTicketDetails();
    }, []);

    return <Ticket ticketDetails={ticketDetails} />;
};

export default TicketContainer;