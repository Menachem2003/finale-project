import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./Cart.css";
import type { Product } from "@clinic/shared";

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    img?: string;
    description?: string;
  };
  quantity: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data);
      } catch (err: unknown) {
        console.error("Failed to fetch cart", err);
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 401
        ) {
          navigate("/login");
        } else {
          setError("שגיאה בטעינת הסל");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setUpdating(productId);
    try {
      await api.put(
        `/cart/${productId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh cart
      const response = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (err) {
      console.error("Failed to update cart", err);
      alert("שגיאה בעדכון הכמות");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("האם אתה בטוח שברצונך להסיר מוצר זה מהסל?")) {
      return;
    }

    setUpdating(productId);
    try {
      await api.delete(`/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh cart
      const response = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (err) {
      console.error("Failed to remove item", err);
      alert("שגיאה בהסרת המוצר");
    } finally {
      setUpdating(null);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.productId.price * item.quantity,
      0
    );
  };

  if (loading) {
    return <div className="cart-loading">טוען את הסל...</div>;
  }

  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>הסל שלך ריק</h2>
        <button onClick={() => navigate("/products")} className="continue-shopping-btn">
          המשך לקניות
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">סל הקניות שלך</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.productId._id} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={item.productId.img || "/clinic/logo.jpg"}
                  alt={item.productId.name}
                />
              </div>
              <div className="cart-item-details">
                <h3>{item.productId.name}</h3>
                <p className="cart-item-price">
                  מחיר ליחידה: {item.productId.price} ₪
                </p>
                {item.productId.description && (
                  <p className="cart-item-description">
                    {item.productId.description}
                  </p>
                )}
              </div>
              <div className="cart-item-actions">
                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.productId._id,
                        item.quantity - 1
                      )
                    }
                    disabled={updating === item.productId._id || item.quantity <= 1}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(
                        item.productId._id,
                        item.quantity + 1
                      )
                    }
                    disabled={updating === item.productId._id}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <p className="item-total">
                  סה"כ: {item.productId.price * item.quantity} ₪
                </p>
                <button
                  onClick={() => handleRemoveItem(item.productId._id)}
                  disabled={updating === item.productId._id}
                  className="remove-btn"
                >
                  הסר
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>סיכום הזמנה</h2>
          <div className="summary-row">
            <span>סה"כ מוצרים:</span>
            <span>
              {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <div className="summary-row total">
            <span>סה"כ לתשלום:</span>
            <span>{calculateTotal().toFixed(2)} ₪</span>
          </div>
          <button className="checkout-btn" onClick={() => alert("תהליך התשלום יפותח בקרוב")}>
            המשך לתשלום
          </button>
          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/products")}
          >
            המשך לקניות
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
