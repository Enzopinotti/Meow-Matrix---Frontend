import React, { useState } from 'react'
import Swal from 'sweetalert2';

const FormDocuments = ({user, setUser}) => {

    const [identification, setIdentification] = useState(null);
    const [proofOfAddress, setProofOfAddress] = useState(null);
    const [bankStatement, setBankStatement] = useState(null);

    
    const handleFileChange = (e, setter) => {
        setter(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            const formFileData = new FormData();
            formFileData.append('identification', identification);
            formFileData.append('address', proofOfAddress);
            formFileData.append('bankStatement', bankStatement);

            const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/users/${user._id}/documents`, {
                method: 'POST',
                credentials: 'include',
                body: formFileData,
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Documentos subidos correctamente.',
                });
            } else {
                throw new Error('Error al subir documentos.');
            }
        } catch (error) {
            console.error('Error al subir documentos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al subir documentos.',
            });
        }
    };
    return (
        <section className="form-documents-container">
            <h2 className="form-documents-title">Documentación Para Ser Premium</h2>
            <form onSubmit={handleSubmit} className="form-documents-form">
                <div className="file-input-wrapper">
                    <label htmlFor="identification" className="file-input-label">Identificación:</label>
                    <input type="file" id="identification" name="identification" onChange={(e) => handleFileChange(e, setIdentification)} className="file-input" />
                </div>
                <div className="file-input-wrapper">
                    <label htmlFor="proofOfAddress" className="file-input-label">Comprobante de domicilio:</label>
                    <input type="file" id="proofOfAddress" name="proofOfAddress" onChange={(e) => handleFileChange(e, setProofOfAddress)} className="file-input" />
                </div>
                <div className="file-input-wrapper">
                    <label htmlFor="bankStatement" className="file-input-label">Comprobante de estado de cuenta:</label>
                    <input type="file" id="bankStatement" name="bankStatement" onChange={(e) => handleFileChange(e, setBankStatement)} className="file-input" />
                </div>
                <button type="submit" className="submit-button">Subir Documentos</button>
            </form>
        </section>
    );
}

export default FormDocuments