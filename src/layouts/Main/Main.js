import { Route, Routes } from "react-router-dom";
import Counter from "../../components/Counter";
import ProductListContainer from "../../components/ProductList/ProductListContainer";
import Home from "../../pages/Home";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import RecoveryPass from "../../pages/RecoveryPass";
import ResetPassword from "../../pages/ResetPassword";
import NotFound from "../../pages/NotFound";
import ProductDetailContainer from "../../components/ProductDetail/ProductDetailContainer";
import Profile from "../../pages/Profile";
import CartContainer from "../../components/Cart/CartContainer";
import TicketContainer from "../../components/Ticket/TicketContainer";

const Main = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recoveryPass" element={<RecoveryPass />} />
            <Route path="/resetPassword/:token" element={<ResetPassword />} />
            <Route path="/products" element={<ProductListContainer />} />
            <Route path="/products/:id" element={<ProductDetailContainer />} />
            <Route path="/categories" element={<Counter />} />
            <Route path="/sobreNosotros" element={<Counter />} />
            <Route path="/cart" element={<CartContainer />} />
            <Route path="/ticket" element={<TicketContainer />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default Main;