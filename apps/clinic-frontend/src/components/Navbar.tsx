import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { useContext, useState } from "react";
import AuthContext, { useAuth } from "../contexts/AuthContext";

interface Link {
  path: string;
  title: string;
  roles: string[];
}

const links: Link[] = [
  { path: "/", title: "בית", roles: ["guest", "user", "admin"] },
  {
    path: "/products",
    title: "המוצרים שלנו",
    roles: ["guest", "user", "admin"],
  },
  { path: "/team", title: "הצוות", roles: ["guest", "user", "admin"] },
  { path: "/contact", title: "צור קשר", roles: ["guest", "user", "admin"] },
  { path: "/cart", title: "סל קניות", roles: ["user", "admin"] },
  { path: "/login", title: "התחברות", roles: ["guest"] },
  { path: "/signup", title: "הרשמה", roles: ["guest"] },
  { path: "/admin", title: "ניהול", roles: ["admin"] },
];

function Navbar() {
  const authContext = useContext(AuthContext);
  const { user, setUser } = authContext || { user: null, setUser: () => {} };
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (setUser) {
      setUser(null);
    }
  };

  const currentUserRole = user?.role || "guest";

  return (
    <nav className="navbar">
      <img src="/clinic/headerLogo.jpg" alt="לוגו המרפאה" className="logo" />

      <div className="hamburger-menu" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        {links
          .filter((link) => link.roles.includes(currentUserRole))
          .map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? "active-link" : "")}
              >
                {link.title}
              </NavLink>
            </li>
          ))}
        {user && (
          <>
            <button onClick={handleLogout} className="logout-button">
              התנתקות
            </button>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
