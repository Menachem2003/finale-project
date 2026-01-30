import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import { useState, useEffect } from "react";
import type { Product } from "@clinic/shared";
import "./ProductPage.css";

function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.data || response.data);
      } catch (err: unknown) {
        console.error("Failed to fetch product", err);
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

  const handleAddToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("צריך להירשם או להתחבר כדי לבצע רכישה");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      await api.post(
        "/cart",
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("המוצר נוסף לסל בהצלחה!");
    } catch (err: unknown) {
      console.error("Error adding to cart:", err);
      
      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = err as { response?: { status?: number; data?: { message?: string } } };
        
        if (response.response?.status === 401) {
          alert("עליך להתחבר כדי לבצע רכישה");
          navigate("/login");
          return;
        }
        
        if (response.response?.status === 400) {
          const errorMessage = response.response?.data?.message || "המוצר כבר נמצא בסל";
          alert(`שגיאה: ${errorMessage}`);
          return;
        }
        
        if (response.response?.status === 404) {
          const errorMessage = response.response?.data?.message || "המוצר לא נמצא";
          alert(`שגיאה: ${errorMessage}`);
          return;
        }
        
        if (response.response?.status === 500) {
          alert("שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר או פנה לתמיכה.");
          return;
        }
        
        const errorMessage = response.response?.data?.message || "שגיאה בהוספת מוצר לסל";
        alert(`שגיאה: ${errorMessage}`);
      } else {
        alert("שגיאה בהוספת מוצר לסל. אנא נסה שוב מאוחר יותר.");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("צריך להירשם או להתחבר כדי לבצע רכישה");
      navigate("/login");
      return;
    }

    setPurchasing(true);
    try {
      // First add to cart
      await api.post(
        "/cart",
        {
          productId: product._id,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Navigate to cart/checkout
      navigate("/cart");
    } catch (err: unknown) {
      console.error("Error purchasing product:", err);
      
      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = err as { response?: { status?: number; data?: { message?: string } } };
        
        if (response.response?.status === 401) {
          alert("עליך להתחבר כדי לבצע רכישה");
          navigate("/login");
          return;
        }
        
        if (response.response?.status === 400) {
          const errorMessage = response.response?.data?.message || "המוצר כבר נמצא בסל";
          alert(`שגיאה: ${errorMessage}`);
          return;
        }
        
        if (response.response?.status === 404) {
          const errorMessage = response.response?.data?.message || "המוצר לא נמצא";
          alert(`שגיאה: ${errorMessage}`);
          return;
        }
        
        if (response.response?.status === 500) {
          alert("שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר או פנה לתמיכה.");
          return;
        }
        
        const errorMessage = response.response?.data?.message || "שגיאה בהוספת מוצר לסל";
        alert(`שגיאה: ${errorMessage}`);
      } else {
        alert("שגיאה בהוספת מוצר לסל. אנא נסה שוב מאוחר יותר.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading)
    return <div className="product-loading">טוען את פרטי המוצר...</div>;
  if (error) return <div className="product-error">{error}</div>;
  if (!product)
    return <div className="product-not-found">מוצר זה לא נמצא במערכת</div>;

  const maxQuantity = product.count || 1;

  return (
    <div className="product-page">
      <button 
        onClick={() => navigate("/products")} 
        className="back-button"
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#95a5a6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1em'
        }}
      >
        ← חזרה למוצרים
      </button>
      
      <h1 className="product-page-title">{product.name}</h1>
      <div className="product-page-content">
        <div className="product-page-image">
          <img src={product.img} alt={product.name} />
        </div>
        <div className="product-page-details">
          <div className="product-info-section">
            <p>
              <strong>תיאור:</strong> {product.description || "אין תיאור זמין"}
            </p>
            <p className="product-price-large">
              <strong>מחיר:</strong> {product.price} ₪
            </p>
            <p>
              <strong>מלאי זמין:</strong> {product.count} יחידות
            </p>
            <p>
              <strong>קטגוריה:</strong> {product.category}
            </p>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label htmlFor="quantity">כמות:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= maxQuantity) {
                    setQuantity(val);
                  }
                }}
                className="quantity-input"
              />
            </div>

            <div className="action-buttons">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || purchasing}
                className="add-to-cart-button"
              >
                {addingToCart ? "מוסיף..." : "הוסף לסל"}
              </button>
              <button
                onClick={handlePurchase}
                disabled={addingToCart || purchasing}
                className="purchase-button"
              >
                {purchasing ? "מעבד..." : "קנה עכשיו"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
