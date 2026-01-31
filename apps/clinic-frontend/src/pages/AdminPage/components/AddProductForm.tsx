import React, { useState } from "react";
import type { Category, Product } from "@clinic/shared";

interface AddProductFormProps {
  categories: Category[];
  catLoading: boolean;
  catError: string;
  onAdd: (product: Omit<Product, "_id" | "createdAt">) => void;
  onCancel: () => void;
}

export default function AddProductForm({
  categories,
  catLoading,
  catError,
  onAdd,
  onCancel,
}: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    count: "",
    category: "",
    img: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("שם המוצר הוא שדה חובה");
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      setError("מחיר לא תקין");
      return;
    }

    if (!formData.count || parseInt(formData.count) < 0) {
      setError("כמות מלאי לא תקינה");
      return;
    }

    if (!formData.category) {
      setError("יש לבחור קטגוריה");
      return;
    }

    onAdd({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseFloat(formData.price),
      count: parseInt(formData.count),
      category: formData.category,
      img: formData.img.trim() || undefined,
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      price: "",
      count: "",
      category: "",
      img: "",
    });
  };

  return (
    <div className="admin-products-section" style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>הוסף מוצר חדש</h3>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
          <input
            type="text"
            placeholder="שם המוצר *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="add-product-input"
            required
            style={{ width: "100%" }}
          />
          <input
            type="text"
            placeholder="תיאור המוצר"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="add-product-input"
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="מחיר *"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="add-product-input"
              required
              style={{ flex: 1 }}
            />
            <input
              type="number"
              min="0"
              placeholder="כמות מלאי *"
              value={formData.count}
              onChange={(e) =>
                setFormData({ ...formData, count: e.target.value })
              }
              className="add-product-input"
              required
              style={{ flex: 1 }}
            />
          </div>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="add-product-select"
            required
            style={{ width: "100%" }}
            disabled={catLoading}
          >
            <option value="">בחר קטגוריה *</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="קישור לתמונה (אופציונלי)"
            value={formData.img}
            onChange={(e) => setFormData({ ...formData, img: e.target.value })}
            className="add-product-input"
            style={{ width: "100%" }}
          />
          {error && <p className="add-product-error">{error}</p>}
          {catError && <p className="add-product-error">{catError}</p>}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" className="add-product-button">
              הוסף מוצר
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="category-edit-button"
            >
              ביטול
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
