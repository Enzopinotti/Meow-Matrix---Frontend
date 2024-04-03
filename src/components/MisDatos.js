import React, { useState, useContext } from 'react';
import { AuthContext } from './Contexts/AuthContext';
import Swal from 'sweetalert2';
import { formatDate } from '../utils/ProductUtils';
import UploadedDocuments from './UploadedDocuments/UploadedDocuments';
import FormDocuments from './Formularios/FormDocuments';

const MisDatos = () => {

    const { user, setUser } = useContext(AuthContext);

    const [editingField, setEditingField] = useState(null);

    const [formData, setFormData] = useState({
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        password: '***********',
        birthDate: user.birthDate,
        phone: user.phone,
    });

    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditField = (fieldName) => {
        setEditingField(fieldName);
    };
    
    const handleCancelEdit = () => {
        setFormData({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            password: '***********',
            birthDate: user.birthDate,
            phone: user.phone,
        });
        setEditingField(null);
    };

    const checkEmailAvailability = async (email) => {
        try {
            const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/users/email/${email}`);
            const data = await response.json();
            console.log('trae usuario: ', data)
            return data;
        } catch (error) {
            console.error('Error al verificar la disponibilidad del correo electrónico:', error);
            // Manejar el error aquí
            return false;
        }
    };
    
    const changeData = async (updatedData) => {
        try {
            const modifiedData = {};
            let includePassword = false; 
            // Comparamos cada campo con el valor original, excluyendo la contraseña
            for (const key in updatedData) {
                if (updatedData[key] !== user[key]) {
                    // Verificar si el campo actual es la contraseña
                    if (key === 'password') {
                        includePassword = true;
                        if(updatedData[key] !== '***********'){
                            modifiedData[key] = updatedData[key]
                        }
                    
                    } else {
                        // Agregar el campo al objeto de datos modificados
                        modifiedData[key] = updatedData[key];
                    }
                }
            }
            console.log('datos modificados: ', modifiedData)
            console.log('longitud: ', Object.keys(modifiedData).length)

            // Si hay cambios en los datos excepto la contraseña, realizamos la solicitud PUT
            if (Object.keys(modifiedData).length > 0 || includePassword) {
                console.log('Datos modificados que se envían: ', modifiedData);
    
                const response = await fetch(`https://meowmatrix-backend-2v-production.up.railway.app/api/users/${user._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(modifiedData),
                });
                console.log('Respuesta de la solicitud PUT:', response)
                if (response.ok) {
                    const data = await response.json();
                    console.log('Datos recibidos put:', data);

                    if (data.payload.token) {
                        document.cookie = `access_token=${data.payload.token}; max-age=3600; path=/`;
                        setUser(data.payload.user);
                    }else{
                        console.log('No hay token')
                        setUser(data.payload)
                    }
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Dato actualizado',
                        text: 'El dato ha sido actualizado correctamente.',
                    });
                } else {
                    // Manejar errores de la respuesta del servidor
                    const errorData = await response.json();
                    console.log(errorData); // Muestra el error en la consola
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: errorData.error || 'Error al cargar el archivo',
                    });
                }
            }else{
                Swal.fire({
                    icon: 'info',
                    title: 'Sin cambios',
                    text: 'No se han realizado cambios en los datos.',
                });
            
            }
    
            // Tratamiento especial para la contraseña si se modificó
            if (updatedData.password !== formData.password) {
                // Aquí puedes implementar la lógica para actualizar la contraseña
                // Por ejemplo, puedes mostrar un formulario de confirmación de contraseña nueva
                // y enviar una solicitud adicional para actualizarla.
                console.log('La contraseña ha sido modificada. Tratamiento especial necesario.');
            }
        } catch (error) {
            console.error('Error al actualizar el dato:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al actualizar el dato.',
            });
        }
    };

    
    // Función para solicitar la contraseña al usuario
    const getPasswordFromUser = async () => {
        return Swal.fire({
            title: 'Ingresa tu contraseña',
            input: 'password',
            inputPlaceholder: 'Contraseña',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes ingresar tu contraseña';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                return result.value;
            } else {
                return null; // Si el usuario cancela, devuelve null
            }
        });
    };

    // Función para verificar si la contraseña ingresada por el usuario coincide con la del usuario actual
    const verifyPassword = async (passwordEntered) => {
        const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/sessions/verify-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user._id,
                password: passwordEntered,
                newPassword: formData.password,
            }),
        });
        console.log('Contraseña Que ingresó para confirmar', passwordEntered)
        const data = await response.json();
        console.log('data:', data)
        if(data.error){
            console.log('error:', data.error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.error,
            });
        }else{
            return data.payload.passwordMatched;
        }
        
        console.log('data:', data)  
       
    };

    const handleConfirmEdit = async () => {
        try {
            // Verificar si se está editando el email o la contraseña
            if (editingField === 'email' || editingField === 'password') {
                // Obtener la contraseña ingresada por el usuario
                const passwordEntered = await getPasswordFromUser();
                if (!passwordEntered) return; // Si el usuario cancela, no proceder
                // Verificar si la contraseña ingresada coincide con la del usuario actual
                const passwordMatched = await verifyPassword(passwordEntered);
                console.log('passwordMatched:', passwordMatched)
                if (!passwordMatched) {
                    if (passwordMatched === undefined){
                        return;
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'La contraseña ingresada no coincide con la del usuario actual.',
                    })
                    return;
                 } // Si la contraseña no coincide, no proceder
                if (editingField === 'password' && formData.password !== confirmPassword) {
                    // Mostrar mensaje de error si las contraseñas no coinciden
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'La nueva contraseña y su confirmación no coinciden.',
                    });
                    return; // Detener la ejecución si las contraseñas no coinciden
                }
                if (editingField === 'email') {
                    const userByEmail = await checkEmailAvailability(formData.email);
                    if (!userByEmail.error) {
                        // Mostrar un mensaje de error si el correo electrónico ya está en uso
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'El correo electrónico ingresado ya está en uso.',
                        });
                        return; // Detener la ejecución si el correo electrónico ya está en uso
                    }else{
                        console.log('no hay error')
                    }
                }
            }
            // Realizar la solicitud PUT para actualizar los datos del usuario
            console.log('Datos antes de mandar a ChangeData',formData)
            await changeData(formData);
            setEditingField(null); // Finalizar la edición
            setFormData({ ...formData, password: '*********' });
        } catch (error) {
            console.error('Error al actualizar el dato:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al actualizar el dato.',
            });
        }
    };


    return (
        <div className='mis-datos-container'>
            <section className='datos-container'>
                <h2>Mis Datos</h2>
                <ul>
                    <li>
                        <label>Nombre/s:</label>
                        <div className='field-container'>
                            {editingField === 'name' ? (
                                <>
                                    <input type='text' name='name' value={formData.name} onChange={handleChange} />
                                    <button onClick={handleConfirmEdit}>Confirmar</button>
                                    <button onClick={handleCancelEdit}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <span>{formData.name}</span>
                                    <img src='./img/icons/lapiz_negro.png' alt='Edit' onClick={() => handleEditField('name')} />
                                </>
                            )}
                        </div>
                    </li>
                    <li>
                        <label>Apellido/s:</label>
                        <div className='field-container'>
                            {editingField === 'lastName' ? (
                                <>
                                    <input type='text' name='lastName' value={formData.lastName} onChange={handleChange} />
                                    <button onClick={handleConfirmEdit}>Confirmar</button>
                                    <button onClick={handleCancelEdit}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <span>{formData.lastName}</span>
                                    <img src='./img/icons/lapiz_negro.png' alt='Edit' onClick={() => handleEditField('lastName')} />
                                </>
                            )}
                        </div>
                    </li>
                    <li>
                        <label>Email:</label>
                        <div className='field-container'>
                            {editingField === 'email' ? (
                                <>
                                    <input type='text' name='email' value={formData.email} onChange={handleChange} />
                                    <button onClick={handleConfirmEdit}>Confirmar</button>
                                    <button onClick={handleCancelEdit}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <span>{formData.email}</span>
                                    <img src='./img/icons/lapiz_negro.png' alt='Edit' onClick={() => handleEditField('email')} />
                                </>
                            )}
                        </div>
                    </li>
                    <li>
                        <label>Contraseña:</label>
                        <div className='field-container'>
                            {editingField === 'password' ? (
                                <>
                                    <label>Nueva Contraseña:</label>
                                    <input type='password' name='password' value={formData.password} onChange={handleChange} />
                                    <br />
                                    <label>Confirmar Contraseña:</label>
                                    <input type='password' name='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                    <br />
                                    <button onClick={handleConfirmEdit}>Confirmar</button>
                                    <button onClick={handleCancelEdit}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <span>{formData.password}</span>
                                    <img src='./img/icons/lapiz_negro.png' alt='Edit' onClick={() => handleEditField('password')} />
                                </>
                            )}
                        </div>
                    </li>
                    <li>
                        <label>BirthDate:</label>
                        <div className='field-container'>
                            {editingField === 'birthDate' ? (
                                <>
                                    <input type='text' name='birthDate' value={formatDate(new Date(formData.birthDate)) } onChange={handleChange} />
                                    <button onClick={handleConfirmEdit}>Confirmar</button>
                                    <button onClick={handleCancelEdit}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <span>{formatDate(new Date(formData.birthDate)) }</span>
                                    <img src='./img/icons/lapiz_negro.png' alt='Edit' onClick={() => handleEditField('birthDate')} />
                                </>
                            )}
                        </div>
                    </li>
                    <li>
                        <label>Phone:</label>
                        <div className='field-container'>
                            {editingField === 'phone' ? (
                                <>
                                <input type='text' name='phone' value={formData.phone} onChange={handleChange} />
                                    <button onClick={handleConfirmEdit}>Confirmar</button>
                                    <button onClick={handleCancelEdit}>Cancelar</button>
                                </>
                            ) : (
                                <>
                                    <span>{formData.phone}</span>
                                    <img src='./img/icons/lapiz_negro.png' alt='Edit' onClick={() => handleEditField('phone')} />
                                </>
                            )}
                        </div>
                    </li>
                </ul> 
            </section>
            {user.rol !== 'admin' && (
                <>
                    <FormDocuments user={user} setUser={setUser} />
                    <UploadedDocuments documents={user.documents} wantPremium={user.wantPremium} userRol={user.rol} />
                </>
            )}
        </div>
    );
};

export default MisDatos;
