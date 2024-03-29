import React from 'react';

const DocumentItem = ({ documento }) => {
    console.log(documento)
  const handleDownload = () => {
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
  }
  return (
    <li className="document-item">
      <strong className="document-reason">
        {getReason(documento.reason)}
      </strong>
      {/* Botón para descargar el documento */}
      <button onClick={handleDownload} className="view-document-link">
        Descargar documento
      </button>
    </li>
  );
};

export default DocumentItem;
