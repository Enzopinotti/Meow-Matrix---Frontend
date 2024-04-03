import React, { useContext, useEffect, useState, useRef } from 'react';
import MisLikes from '../components/MisLikes';
import AuthContext from '../components/Contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import MisDatos from '../components/MisDatos';
import AdminView from '../components/AdminView';
import MyProducts from '../components/MProducts/MyProducts';

const Profile = () => {


    const { user, setUser } = useContext(AuthContext);
    const [selectedButton, setSelectedButton] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPremium, setIsPremium ] = useState(false);
 
    useEffect(() => {
        // Verificar si el usuario tiene el rol de 'admin'
        setIsAdmin(user && user.rol === 'admin');
        setIsPremium(user && user.rol === 'premium');
    }, [user]);




    const navigate = useNavigate();
    const location = useLocation();
    const selectedContentRef = useRef(null);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const selected = params.get('selectedButton');

        if (selected === 'mis-favoritos') {
            setSelectedButton('mis-favoritos');
        }
    }, [location.search]);

    useEffect(() => {
        if (selectedButton === 'mis-favoritos' && selectedContentRef.current) {
            setTimeout(() => {
                selectedContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1000); 
        }
        if (selectedButton === 'mis-datos' && selectedContentRef.current) {
            setTimeout(() => {
                selectedContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1000); 
        }
    }, [selectedButton]);

    const handleButtonClick = (buttonType) => {
        setSelectedButton(buttonType);
        navigate(`/profile?selectedButton=${buttonType}`);
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('avatar', selectedFile);

            // Realizar una solicitud POST al servidor para cargar el archivo
            const response = await fetch('https://meowmatrix-backend-2v-production.up.railway.app/api/users/upload-avatar', {
                method: 'POST',
                credentials: 'include', // Incluir credenciales en la solicitud
                body: formData
            });
            console.log('Respuesta de avatar: ',response); // Muestra la respuesta en la consola
            // Verificar el estado de la respuesta
            if (response.ok) {
                // Manejar la respuesta exitosa del servidor
                const data = await response.json();// Muestra los datos en la consola
                setUser(data.payload.user); // Actualizar el contexto con el usuario actualizado
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'El archivo se ha cargado correctamente.'
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
        } catch (error) {
            console.error('Error al cargar el archivo:', error);
        }
    };

    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Debes iniciar sesión o registrarte para acceder al perfil de usuario.',
            showCancelButton: true,
            cancelButtonText: 'Registrarse',
            confirmButtonText: 'Iniciar sesión',
            allowOutsideClick: () => !Swal.isLoading(), // Permitir clic afuera si no se está cargando
            willClose: () => {
                navigate('/');
            }
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/login');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                navigate('/register');
            }
        });
        return <section className='main-profile'></section>;
    } else {
        // Agregar un timestamp al final del URL de la imagen para evitar la caché del navegador
        const imageUrl = `https://meowmatrix-backend-2v-production.up.railway.app${user.avatar}?${new Date().getTime()}`;

        return (
            <section className='main-profile'>
                <section className='section1-profile'>
                    <article className='user-card-container'>
                        <div className='title-container'>
                            <h1>MI CUENTA</h1>
                        </div>
                        <div className='avatar-container'>
                            <img src={imageUrl} alt="avatar" />
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            <button onClick={handleFileUpload}>Subir Avatar</button>
                        </div>
                        <div className='info-user-container'>
                            <h2 className='data-header'>{user.name} {user.lastName}</h2>
                            <div className='data-footer'>
                                <p><strong>Correo electrónico:</strong> {user.email}</p>
                                <p><strong>Teléfono:</strong> {user.phone}</p>
                            </div>
                        </div>
                    </article>
                    <article className='user-buttons'>
                        <button className={selectedButton === 'mis-favoritos' ? 'selected' : 'buttom-user'} onClick={() => handleButtonClick('mis-favoritos')}><p>Mis Favoritos</p></button>
                        <button className={selectedButton === 'mis-datos' ? 'selected' : 'buttom-user'} onClick={() => handleButtonClick('mis-datos')}><p>Mis Datos</p></button>
                        {isAdmin && <button className={selectedButton === 'admin-view' ? 'selected' : 'buttom-user'} onClick={() => handleButtonClick('admin-view')}><p>Vista de Administrador</p></button>}
                        {isPremium && <button className={selectedButton === 'my-products' ? 'selected' : 'buttom-user'} onClick={() => handleButtonClick('my-products')}><p>Mis Productos</p></button>}
                    </article>
                </section>
                <section className='selected-content'ref={selectedContentRef} >
                    {selectedButton === 'mis-favoritos' && <MisLikes  />}
                    {selectedButton === 'mis-datos' && <MisDatos />}
                    {selectedButton === 'admin-view' && <AdminView />}
                    {selectedButton === 'my-products' && <MyProducts />}
                </section> 
            </section>
        );
    }
};

export default Profile;