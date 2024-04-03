import { BrowserRouter } from 'react-router-dom';
import Footer from "./layouts/Footer/Footer";
import Header from "./layouts/Header/Header";
import Main from "./layouts/Main/Main";
import { AuthProvider } from "./components/Contexts/AuthContext";

import { useEffect, useState } from 'react';
import { CartProvider } from './components/Contexts/CartContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getUserByToken = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/sessions/user-by-token', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok === false) {
          setUser(null);
        }
        if (response.ok) {
          const userData = await response.json();
          console.log('userData: ', userData)
          console.log('resultApp: ', userData)
          const { user: newUser, token } = userData.payload;
          
          if (token) {
            document.cookie = `access_token=${token}; max-age=3600; path=/`;
            setUser(newUser);
          }else{
            console.log('No hay token')
            setUser(userData.payload)
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Manejar errores de red u otros errores
      } finally {
        setLoading(false); // Indicar que la carga ha terminado, independientemente del resultado
      }
    };

    getUserByToken();
  }, [setUser]);

  if (loading) {
    // Mientras se carga el usuario, puedes mostrar un spinner o un mensaje de carga
    return <></>;
  }

  return (
    <BrowserRouter>
      <AuthProvider value={{ user, setUser }}>
        <CartProvider>
          <Header />
          <Main title="Home" />
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
