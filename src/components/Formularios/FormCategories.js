import React from 'react'

const FormCategories = ( { handleSubmit, nameCategory, setNameCategory, description, setDescription } ) => {
  return (
    <section className="form-section">
        <h2 className="section-title">Agregar Nuevo Producto</h2>
        <form className="formulario" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="nameCategory">Nombre de la categoría:</label>
                <input type="text" id="nameCategory" name='nameCategory' value={nameCategory} onChange={(e) => setNameCategory(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="description">Descripción:</label>
                <textarea id="description" name='description' value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <button type="submit" id="addCategoryButton">Agregar Categoría</button>
        </form>
    </section>
  )
}

export default FormCategories