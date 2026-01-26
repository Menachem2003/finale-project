import { useParams } from "react-router-dom";
import { api } from "../../../utils/api";
import { useState, useEffect } from "react";
import type { Product } from "@clinic/shared";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (err: unknown) {
        console.error("Failed to fetch product");
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: unknown }).response
        ) {
          setError("שגיאה בטעינת מוצר");
        } else if (
          err &&
          typeof err === "object" &&
          "request" in err &&
          (err as { request?: unknown }).request
        ) {
          setError(
            "שגיאת רשת: לא ניתן להתחבר לשרת כעת, אנא נסה במועד מאוחר יותר"
          );
        } else {
          setError("בניית הבקשה נכשלה");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading)
    return <div className="product-loading">טוען את פרטי המוצר...</div>;
  if (error) return <div className="product-error">{error}</div>;
  if (!product)
    return <div className="product-not-found">מוצר זה לא נמצא במערכת</div>;

  return (
    <div className="product-page">
      <h1 className="product-page-title">{product.name}</h1>
      <div className="product-page-content">
        <div className="product-page-image">
          <img src={product.img} alt={product.name} />
        </div>
        <div className="product-page-details">
          <p>
            <strong>תיאור:</strong> {product.description}
          </p>
          <p>
            <strong>מחיר:</strong> {product.price} ₪
          </p>
          <p>
            <strong>כמות:</strong> {product.count}
          </p>
          <p>
            <strong>קטגוריה:</strong> {product.category}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
