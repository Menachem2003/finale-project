import { useEffect, useState } from "react";
import AdminUsers from "./components/AdminUsers";
import AdminCategories from "./components/AdminCategories";
import AdminProducts from "./components/AdminProducts";
import AdminReferrals from "./components/AdminReferrals";
import AdminOrders from "./components/AdminOrders";
import AdminDoctors from "./components/AdminDoctors";
import AdminTeam from "./components/AdminTeam";
import AdminSidebarButton from "./components/AdminSidebarButton";
import { api } from "../../utils/api";
import "./Admin.css";
import type { Category } from "@clinic/shared";

const sections = [
  { id: "users", label: "משתמשים" },
  { id: "categories", label: "קטגוריות" },
  { id: "products", label: "מוצרים" },
  { id: "referrals", label: "פניות" },
  { id: "orders", label: "רכישות" },
  { id: "doctors", label: "רופאים" },
  { id: "team", label: "צוות" },
];

export default function AdminPage() {
  const [currentSection, setCurrentSection] = useState("users");
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const { data } = await api.get("/categories");
        setCategories(data || []);
      } catch (err) {
        setCatError("אחזור קטגוריות נכשל");
      }
      setCatLoading(false);
    };
    fetchCategories();
  }, []);

  const handleCategoryUpdated = async (
    categoryCode: string,
    newName: string
  ) => {
    try {
      await api.put(`/categories/${categoryCode}`, {
        name: newName,
      });
      setCategories((prev) => {
        return prev.map((c) =>
          c.categoryCode === categoryCode ? { ...c, name: newName } : c
        );
      });
    } catch {
      alert("עדכון הקטגוריה נכשל");
    }
  };

  const handleCategoryAdd = async (newCategory: Omit<Category, "_id">) => {
    try {
      const { data } = await api.post("/categories", newCategory);
      setCategories((prev) => {
        return [...prev, data];
      });
    } catch {
      alert("הוספת הקטגוריה נכשלה");
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin sidebar">
        <nav className="admin-nav">
          {sections.map((section) => (
            <AdminSidebarButton
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              active={section.id === currentSection}
              label={section.label}
            />
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <h1 className="admin-title">לוח בקרת ניהול</h1>
        {currentSection === "users" && <AdminUsers />}
        {currentSection === "categories" && (
          <AdminCategories
            categories={categories}
            catLoading={catLoading}
            catError={catError}
            onCategoryUpdated={handleCategoryUpdated}
            onCategoryAdd={handleCategoryAdd}
          />
        )}
        {currentSection === "products" && (
          <AdminProducts
            categories={categories}
            catLoading={catLoading}
            catError={catError}
          />
        )}
        {currentSection === "referrals" && <AdminReferrals />}
        {currentSection === "orders" && <AdminOrders />}
        {currentSection === "doctors" && <AdminDoctors />}
        {currentSection === "team" && <AdminTeam />}
      </main>
    </div>
  );
}
