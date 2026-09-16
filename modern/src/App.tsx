import { Link, Route, Routes } from "react-router-dom";
import { resolveApiOrigin } from "./api/config";
import {
  LoginPage,
  RecoveryPage,
  RegisterPage,
  ResetPasswordPage,
} from "./auth/AuthPages";
import { useAuth } from "./auth/AuthContext";
import {
  CartPage,
  CatalogPage,
  OrderDetailPage,
  OrdersPage,
} from "./commerce/CommercePages";
import { StatusPage } from "./components/StatusPage";
import { PrivateFilesPage } from "./files/PrivateFilesPage";

const apiOrigin = resolveApiOrigin(import.meta.env.VITE_API_ORIGIN);

function SessionNav() {
  const { status, user } = useAuth();
  if (status === "authenticated" && user) {
    return <Link to="/files">{user.name}</Link>;
  }
  if (status === "loading") {
    return <span aria-label="Verificando sesión">Sesión…</span>;
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
          <Link to="/orders">Órdenes</Link>
          <Link to="/files">Privados</Link>
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
                description="La autoridad frontend 2026 incorpora sesión backend-owned, comercio B4 con checkout idempotente y archivos privados B5 con multipart tipado, descarga autenticada y storage fuera del navegador."
                apiOrigin={apiOrigin}
              />
            }
          />
          <Route path="/products" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/files" element={<PrivateFilesPage />} />
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
