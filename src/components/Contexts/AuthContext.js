import { createContext, useState } from 'react';

// Creamos el contexto de autenticación
export const AuthContext = createContext();
const { Provider } = AuthContext;

// Creamos un componente proveedor para envolver nuestra aplicación y proporcionar el contexto
export const AuthProvider = (props) => {
    return (
        <Provider value={props.value}>
            {props.children}
        </Provider>
    );
};

export default AuthContext;