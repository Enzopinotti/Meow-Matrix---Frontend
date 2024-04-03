import React from "react";
import DocumentItem from "./DocumentItem";
import Swal from 'sweetalert2';

const UploadedDocuments = ({ documents, wantPremium, userRol }) => {

    const handlePremiumRequest = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/users/premium', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response);

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Solicitud Enviada',
                    text: 'Se ha enviado la solicitud para ser Premium.',
                });
            }
            const data = await response.json();
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Documentación Faltante',
                    text: 'Falta Agregar Documentación para Solicitar ser Premium.',
                });
            }
            // Si la solicitud fue exitosa, muestra un mensaje de éxito usando SweetAlert2
            
        } catch (error) {
            console.error('Error al enviar la solicitud de premium:', error.message);
            // En caso de error, muestra un mensaje de error usando SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un error al enviar la solicitud de premium. Por favor, inténtelo de nuevo más tarde.',
            });
        }
    };
    if (userRol === 'premium') {
        return (
            <section className="uploaded-documents">
                <h2 className="section-title">Documentación Cargada</h2>
                <ul className="document-list">
                    {documents.map((document, index) => (
                        <DocumentItem key={index} documento={document} />
                    ))}
                </ul>
                <p>Eres un usuario premium, no puedes solicitar ser premium.</p>
            </section>
        )
    }

    return (
        <section className="uploaded-documents">
            <h2 className="section-title">Documentación Cargada</h2>
            <ul className="document-list">
                {documents.map((document, index) => (
                    <DocumentItem key={index} documento={document} />
                ))}
            </ul>
            {!wantPremium && <button className="submit-button" onClick={handlePremiumRequest}>Solicitar Premium</button>}
        </section>
    )
};

export default UploadedDocuments;
