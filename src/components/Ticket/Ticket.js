import React from 'react';
import { formatDate, formatPrice } from '../../utils/ProductUtils';

class Ticket extends React.Component {
    render() {
        const { ticketDetails } = this.props;

        return (
            <div className="ticket-container">
                <h2>Detalle del ticket</h2>
                {ticketDetails ? (
                    <div className="ticket-details">
                        {console.log(ticketDetails)}
                        <p><span>ID del ticket:</span> {ticketDetails._id}</p>
                        <p><span>Fecha de compra:</span> {formatDate(new Date(ticketDetails.purchase_datetime))}</p>
                        <p><span>Monto total:</span> ${formatPrice(ticketDetails.amount)}</p>
                        <button className="back-to-games-button" onClick={() => this.props.history.push('/products')}>
                            Volver a Productos
                        </button>
                    </div>
                ) : (
                    <p className="loading-message">Cargando detalles del ticket...</p>
                )}
            </div>
        );
    }
}

export default Ticket;
