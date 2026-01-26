import React, { useEffect, useState, ChangeEvent } from "react";
import { api } from "../../../utils/api";
import type { Category } from "@clinic/shared";

interface SelectProductsProps {
  setSelectedCategory: (category: string) => void;
  selectedCategory: string;
}

export default function SelectProducts({
  setSelectedCategory,
  selectedCategory,
}: SelectProductsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("categories");

        setCategories(data || []);
      } catch (err: unknown) {
        console.log(err);
        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          (err as { status?: number }).status === 404
        ) {
          setError("Categories not found");
          return;
        }
        setError("something went wrong");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <>
      {isLoading && <p className="filter-loading">טוען</p>}
      {error && <p className="filter-error-message">{error}</p>}
      <select
        id="category"
        value={selectedCategory}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          setSelectedCategory(e.target.value)
        }
        className="input-filter-product"
        aria-label="בחר קטגוריה"
      >
        <option value="">כל הקטגוריות</option>
        {categories.map(({ name, categoryCode, _id }) => (
          <option key={_id} value={categoryCode}>
            {name}
          </option>
        ))}
      </select>
    </>
  );
}
