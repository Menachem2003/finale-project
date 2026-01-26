import React from "react";
import type { Category } from "@clinic/shared";

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
  return (
    <div>
      <h2>ניהול מוצרים</h2>
      {catLoading && <p>טוען...</p>}
      {catError && <p className="error">{catError}</p>}
      <p>פונקציונליות ניהול מוצרים תתווסף בקרוב</p>
    </div>
  );
}
