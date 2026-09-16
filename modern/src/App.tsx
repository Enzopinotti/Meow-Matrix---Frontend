import { Link, Route, Routes } from "react-router-dom";
import { resolveApiOrigin } from "./api/config";
import {
  LoginPage,
  RecoveryPage,
  RegisterPage,
  ResetPasswordPage,
} from "./auth/AuthPages";
import { useAuth } from "./auth/AuthContext";
import { StatusPage } from "./components/StatusPage";

const apiOrigin = resolveApiOrigin(import.meta.env.VITE_API_ORIGIN);

function SessionNav() {
  const { status, user } = useAuth();
  if (status === "authenticated" && user) {
    return <Link to="/login">{user.name}</Link>;
  }
  return <Link to="/login">Ingresar</Link>;
}

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
          <SessionNav />
        </nav>
      </header>

      <main id="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <StatusPage
                title="Meow Matrix 2026"
                description="La autoridad frontend 2026 ya cuenta con contrato API tipado y sesión backend-owned. Los flujos comerciales se incorporan sólo cuando su consistencia full-stack queda probada."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route
            path="/products"
            element={
              <StatusPage
                title="Catálogo en reconstrucción"
                description="Product y Category ya tienen contrato v1; la siguiente iteración conectará persistencia de catálogo y estados visuales reales sin inventar stock."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <StatusPage
                title="Carrito en reconstrucción"
                description="B4 hará server-authoritative el carrito, stock, totales y creación de órdenes antes de habilitar checkout."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
