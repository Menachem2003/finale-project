import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { Category, Product } from "@clinic/shared";
import AddProductForm from "./AddProductForm";

interface AdminProductsProps {
  categories: Category[];
  catLoading: boolean;
  catError: string;
}

export default function AdminProducts({
  categories,
  catLoading,
  catError,
}: AdminProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products");
      setProducts(data || []);
    } catch (err) {
      setError("אחזור מוצרים נכשל");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, "_id" | "createdAt">) => {
    try {
      const { data } = await api.post("/products", newProduct);
      setProducts((prev) => [data, ...prev]);
      setShowAddForm(false);
      alert("המוצר נוסף בהצלחה!");
    } catch (err: unknown) {
      console.error("Error adding product:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "הוספת המוצר נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const handleUpdateProduct = async (
    productId: string,
    updatedData: Partial<Product>
  ) => {
    try {
      const { data } = await api.put(`/products/${productId}`, updatedData);
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? data : p))
      );
      setEditingProductId(null);
      alert("המוצר עודכן בהצלחה!");
    } catch (err: unknown) {
      console.error("Error updating product:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "עדכון המוצר נכשל";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מוצר זה?")) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      alert("המוצר נמחק בהצלחה!");
    } catch (err: unknown) {
      console.error("Error deleting product:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "מחיקת המוצר נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="admin-products-loading">
        <p>טוען מוצרים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-products-section">
      <div className="admin-products-title">
        <h2>ניהול מוצרים</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-product-button"
          style={{ marginRight: "auto" }}
        >
          {showAddForm ? "ביטול" : "הוסף מוצר חדש"}
        </button>
      </div>

      {showAddForm && (
        <AddProductForm
          categories={categories}
          catLoading={catLoading}
          catError={catError}
          onAdd={handleAddProduct}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="admin-products-table-container">
        <table className="admin-products-table">
          <thead className="admin-products-table-header">
            <tr>
              <th className="admin-products-table-th">תמונה</th>
              <th className="admin-products-table-th">שם מוצר</th>
              <th className="admin-products-table-th">תיאור</th>
              <th className="admin-products-table-th">קטגוריה</th>
              <th className="admin-products-table-th">מחיר</th>
              <th className="admin-products-table-th">מלאי</th>
              <th className="admin-products-table-th">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                  אין מוצרים להצגה
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <ProductRow
                  key={product._id}
                  product={product}
                  categories={categories}
                  isEditing={editingProductId === product._id}
                  onEdit={() => setEditingProductId(product._id)}
                  onCancel={() => setEditingProductId(null)}
                  onUpdate={handleUpdateProduct}
                  onDelete={handleDeleteProduct}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ProductRowProps {
  product: Product;
  categories: Category[];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (productId: string, data: Partial<Product>) => void;
  onDelete: (productId: string) => void;
}

function ProductRow({
  product,
  categories,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
}: ProductRowProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price.toString(),
    count: product.count.toString(),
    category: product.category,
    img: product.img || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(product._id, {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      count: parseInt(formData.count),
      category: formData.category,
      img: formData.img || undefined,
    });
  };

  if (isEditing) {
    return (
      <tr className="product-row-editing">
        <td className="product-cell-editing">
          <img
            src={formData.img || "/placeholder.png"}
            alt={formData.name}
            className="product-card-image"
            style={{ width: "60px", height: "40px", objectFit: "cover" }}
          />
        </td>
        <td className="product-cell-editing">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="product-card-input"
            required
          />
        </td>
        <td className="product-cell-editing">
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="product-card-input"
          />
        </td>
        <td className="product-cell-editing">
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="product-card-select"
            required
          >
            <option value="">בחר קטגוריה</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </td>
        <td className="product-cell-editing">
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            className="product-card-input"
            required
          />
        </td>
        <td className="product-cell-editing">
          <input
            type="number"
            min="0"
            value={formData.count}
            onChange={(e) =>
              setFormData({ ...formData, count: e.target.value })
            }
            className="product-card-input"
            required
          />
        </td>
        <td className="product-cell-editing">
          <div className="product-card-actions">
            <button
              onClick={handleSubmit}
              className="product-card-submit-button"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
            >
              שמור
            </button>
            <button
              onClick={onCancel}
              className="category-edit-button"
              style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
            >
              ביטול
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="product-row">
      <td className="product-cell">
        <img
          src={product.img || "/placeholder.png"}
          alt={product.name}
          className="product-card-image"
          style={{ width: "60px", height: "40px", objectFit: "cover" }}
        />
      </td>
      <td className="product-cell">{product.name}</td>
      <td className="product-cell">
        {product.description?.substring(0, 50)}
        {product.description && product.description.length > 50 ? "..." : ""}
      </td>
      <td className="product-cell">{product.category}</td>
      <td className="product-cell">₪{product.price.toFixed(2)}</td>
      <td className="product-cell">
        <span
          style={{
            fontWeight: "bold",
            color: product.count === 0 ? "#dc2626" : product.count < 10 ? "#f59e0b" : "#16a34a",
          }}
        >
          {product.count}
        </span>
      </td>
      <td className="product-cell">
        <div className="product-card-actions">
          <button
            onClick={onEdit}
            className="product-card-edit-button"
            title="ערוך"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="product-card-delete-button"
            title="מחק"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}
