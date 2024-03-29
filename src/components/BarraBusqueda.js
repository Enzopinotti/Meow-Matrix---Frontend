import React, { useState } from 'react'

const BarraBusqueda = () => {
  const [busqueda, setBusqueda] = useState('');

  const handleChange = (event) => {
    setBusqueda(event.target.value);
    console.log(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Aquí puedes realizar la búsqueda utilizando el valor almacenado en el estado 'busqueda'
    console.log("Realizar búsqueda con:", busqueda);
  };

  return (
    <form className='barra-busqueda-container' onSubmit={handleSubmit}>
        <input type='text' name='busqueda' placeholder="Buscar Juego..." value={busqueda} onChange={handleChange}></input>
        <button type="submit">
          <img src='/img/icons/lupa.png' className='lupa-img' alt="Buscar" />
        </button>
    </form>
  )
}

export default BarraBusqueda