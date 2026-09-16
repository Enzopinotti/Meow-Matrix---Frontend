import { Link, Route, Routes } from "react-router-dom";
import { resolveApiOrigin } from "./api/config";
import { StatusPage } from "./components/StatusPage";

const apiOrigin = resolveApiOrigin(import.meta.env.VITE_API_ORIGIN);

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          Meow Matrix
        </Link>
        <nav aria-label="Navegación principal">
          <Link to="/products">Productos</Link>
          <Link to="/cart">Carrito</Link>
          <Link to="/login">Ingresar</Link>
        </nav>
      </header>

      <main id="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <StatusPage
                title="Meow Matrix 2026"
                description="La nueva autoridad frontend ya está separada del CRA histórico. Los flujos se migran sólo cuando su contrato full-stack queda probado."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route
            path="/products"
            element={
              <StatusPage
                title="Catálogo en reconstrucción"
                description="La UI histórica existe, pero el catálogo 2026 se conectará después de fijar schemas Product/Category y estados de error/loading."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <StatusPage
                title="Carrito en reconstrucción"
                description="No se simulan precios ni checkout: el carrito moderno esperará la autoridad server-side de producto, stock y totales."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route
            path="/login"
            element={
              <StatusPage
                title="Auth en reconstrucción"
                description="La sesión 2026 será backend-owned con cookie HttpOnly. Este frontend no escribe ni persiste tokens de autenticación."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route
            path="/register"
            element={
              <StatusPage
                title="Registro en reconstrucción"
                description="El formulario se habilitará cuando el DTO y las reglas de registro estén compartidos con la API."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route
            path="*"
            element={
              <StatusPage
                title="Ruta no encontrada"
                description="La ruta no forma parte de la autoridad frontend 2026."
                apiOrigin={apiOrigin}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
