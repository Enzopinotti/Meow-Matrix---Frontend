import React from 'react';
import Pagination from '../Pagination';
import { formatDate } from '../../utils/ProductUtils';
import Swal from 'sweetalert2';

const UsersList = ({ users, currentPage, totalPages, pageNumbers, handlePrevPage, handleNextPage, setCurrentPage, handleAcceptPremiumRequest, handleRejectPremiumRequest, handleDeleteUser, handleDeleteInactiveUsers }) => {
    

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

    const confirmDeleteUser = (userId) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará permanentemente al usuario. ¿Estás seguro de continuar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar usuario',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteUser(userId);
            }
        });
    };

    return (
        <section className="users-list">
            <button className="delete-inactive-users-button" onClick={handleDeleteInactiveUsers}>Eliminar Usuarios Inactivos</button>
            <div className="user-cards">
                {users.map(user => (
                    user.rol !== 'admin' && (
                        <div className="user-card" key={user._id}>
                            <div className='delete_user' onClick={() => confirmDeleteUser(user._id)}>
                                <img src='./img/remove.png' alt="Eliminar Usuario" />
                            </div>
                            <div className="user-avatar" onClick={() => confirmDeleteUser(user._id)}>
                                {user.avatar ? (
                                    <img src={`https://meowmatrix-backend-2v-production.up.railway.app/${user.avatar}?${new Date().getTime()}`} alt="Avatar" />
                                ) : (
                                    <img src={`https://meowmatrix-backend-2v-production.up.railway.app/img/default2.png`} alt="Default Avatar" />
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
                                {user.wantPremium && ( 
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
