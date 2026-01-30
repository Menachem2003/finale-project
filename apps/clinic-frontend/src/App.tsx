import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/HomePage/Home";
import Contact from "./pages/ContactPage/Contact";
import Team from "./pages/TeamPage/Team";
import Admin from "./pages/AdminPage/Admin";
import RegisterComponent from "./User/RegisterComponent";
import LoginComponent from "./User/LoginComponent";
import AuthContext from "./contexts/AuthContext";
import CartContext from "./contexts/CartContext";
import { useEffect, useState } from "react";
import Products from "./pages/ProductsPage/Products";
import { api } from "./utils/api";
import ProductPage from "./pages/ProductsPage/component/ProductPage";
import Cart from "./pages/CartPage/Cart";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<unknown[]>([]);
  
  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          return;
        }
        const { data } = await api.get("auth/validate", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data);
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem("token");
        setUser(null);
      }
    };
    validateToken();
  }, []);
  
  return (
    <div>
      <AuthContext.Provider value={{ user, setUser }}>
        <CartContext.Provider value={{ cartItems, setCartItems }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/team" element={<Team />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            {user ? (
              <>
                <Route path="profile" element={<h1>User page</h1>} />
                {user.role === "admin" && (
                  <Route path="/admin" element={<Admin />} />
                )}
              </>
            ) : (
              <>
                <Route path="/signup" element={<RegisterComponent />} />
                <Route path="/login" element={<LoginComponent />} />
              </>
            )}
            <Route
              path="*"
              element={
                <div>
                  <h1>404</h1>
                  <Link to="/">מעבר לדף בית</Link>
                </div>
              }
            />
          </Routes>
        </CartContext.Provider>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
