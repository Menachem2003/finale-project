import React from "react";
import type { Category } from "@clinic/shared";

interface AdminCategoriesProps {
  categories: Category[];
  catLoading: boolean;
  catError: string;
  onCategoryUpdated: (categoryCode: string, newName: string) => void;
  onCategoryAdd: (newCategory: Omit<Category, "_id">) => void;
}

export default function AdminCategories({
  categories,
  catLoading,
  catError,
  onCategoryUpdated,
  onCategoryAdd,
}: AdminCategoriesProps) {
  return (
    <div>
      <h2>ניהול קטגוריות</h2>
      {catLoading && <p>טוען קטגוריות...</p>}
      {catError && <p className="error">{catError}</p>}
      <ul>
        {categories.map((cat) => (
          <li key={cat._id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}
