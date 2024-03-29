import React from 'react';
import Pagination from '../Pagination';
import { formatDate } from '../../utils/ProductUtils';

const UsersList = ({ users, currentPage, totalPages, pageNumbers, handlePrevPage, handleNextPage, setCurrentPage, handleAcceptPremiumRequest, handleRejectPremiumRequest }) => {
    

    const handleDownload = (documento) => {
        // Crear un enlace temporal
        const link = document.createElement('a');
        // Establecer la URL de descarga y el nombre del archivo
        link.href = documento.reference;
        link.download = `documento_${documento.reason}.pdf`;
        // Hacer clic en el enlace para iniciar la descarga
        link.click();
    };

    const getReason = (reason) => {
        switch (reason) {
            case 'identification':
                return 'Identificación';
            case 'address':
                return 'Dirección';
            case 'bankStatement':
                return 'Estado de cuenta';
            default:
                return 'Documento';
        }
    };

    return (
        <section className="users-list">
            <div className="user-cards">
                {users.map(user => (
                    user.rol !== 'admin' && (
                        <div className="user-card" key={user._id}>
                            <div className="user-avatar">
                                {user.avatar ? (
                                    <img src={`http://localhost:8080${user.avatar}?${new Date().getTime()}`} alt="Avatar" />
                                ) : (
                                    <img src={`http://localhost:8080/img/default2.png`} alt="Default Avatar" />
                                )}
                            </div>
                            <div className="user-info">
                                <h2>{`${user.name} ${user.lastName}`}</h2>
                                <p className="user-last-connection"><strong>Última conexión:</strong> {formatDate(new Date(user.last_connection))}</p>
                                <p className="user-email">{user.email}</p>
                                <p className="user-rol"><strong>Rol:</strong> {user.rol}</p>
                                <div className="user-documents">
                                    <h3>Documentación:</h3>
                                    <ul>
                                        {user.documents.map((document, index) => (
                                            <li key={index} className='admin-document-list'>
                                                <strong className="document-reason">{getReason(document.reason)}</strong>
                                                <button className="view-document-link" onClick={() => handleDownload(document)}>Descargar documento</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {user.wantPremium && ( // Verifica si el usuario quiere ser premium
                                    <div className="premium-request-buttons">
                                        <button className='register-button' onClick={() => handleAcceptPremiumRequest(user._id)}>Aceptar Solicitud de Premium</button>
                                        <button className='submit-button btnRechazo' onClick={() => handleRejectPremiumRequest(user._id)}>Rechazar Solicitud de Premium</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ))}
            </div>
            <Pagination
                pageNumbers={pageNumbers}
                currentPage={currentPage}
                totalPages={totalPages}
                handlePrevPage={handlePrevPage}
                handleNextPage={handleNextPage}
                setCurrentPage={setCurrentPage}
            />
        </section>
    );
};

export default UsersList;
