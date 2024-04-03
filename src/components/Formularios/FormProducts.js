import React from 'react'

const FormProducts = ( {handleSubmit, productName, setProductName, productDescription, setProductDescription, productPrice, setProductPrice, productCode, setProductCode, productStock, setProductStock, productCategory, setProductCategory, categories, handleFileChange} ) => {
    return (
      <section className="form-section">
            <h2 className="section-title">Agregar Nuevo Producto</h2>
            <form className="formulario" id="addProductForm" onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
                <label htmlFor="productName">Nombre del producto:</label>
                <input type="text" id="productName" name="productName" placeholder="Ingrese el nombre del producto" value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="productDescription">Descripción del producto:</label>
                <input type="text" id="productDescription" name="productDescription" placeholder="Ingrese la descripción del producto" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="productPrice">Precio del producto:</label>
                <input type="number" id="productPrice" name="productPrice" placeholder="Ingrese el precio del producto" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="productCode">Código del producto:</label>
                <input type="text" id="productCode" name="productCode" placeholder="Ingrese el código del producto" value={productCode} onChange={(e) => setProductCode(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="productStock">Stock del producto:</label>
                <input type="number" id="productStock" name="productStock" placeholder="Ingrese el stock del producto" value={productStock} onChange={(e) => setProductStock(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="productCategory">Categoría del producto:</label>
                <select id="productCategory" name="productCategory" value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                  <option value="">Seleccione una categoría</option>
                  {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.nameCategory}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="productImage">Imagen del Producto:</label>
                <input type="file" id="productImage" name="productImage" onChange={handleFileChange} />
              </div>
              <button type="submit" id="addProductButton">Agregar Producto</button>
            </form>
          </section>
    )
}

export default FormProducts