import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./Checkout.css";
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

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState("");

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
        const cartData = response.data;
        
        if (!cartData.items || cartData.items.length === 0) {
          navigate("/cart");
          return;
        }
        
        setCart(cartData);
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

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (total, item) => total + item.productId.price * item.quantity,
      0
    );
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || !cart.items || cart.items.length === 0) {
      alert("הסל ריק");
      return;
    }

    if (!cardholderName.trim()) {
      alert("אנא הזן את שם בעל הכרטיס");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create order from cart
      const orderItems = cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
      }));

      const createOrderResponse = await api.post(
        "/orders",
        {
          items: orderItems,
          total: calculateTotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const order = createOrderResponse.data;

      // Step 2: Process payment
      const paymentResponse = await api.post(
        `/orders/${order._id}/payment`,
        {
          paymentMethod: "mock",
          cardholderName: cardholderName.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (paymentResponse.data.success) {
        // Step 3: Clear cart
        await api.delete("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Step 4: Redirect to order confirmation
        navigate(`/orders/${order._id}`);
      } else {
        setError(paymentResponse.data.message || "תהליך התשלום נכשל. אנא נסה שוב.");
        setProcessing(false);
      }
    } catch (err: unknown) {
      console.error("Payment error:", err);
      
      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const response = err as { response?: { status?: number; data?: { message?: string } } };
        
        if (response.response?.status === 401) {
          navigate("/login");
          return;
        }
        
        const errorMessage = response.response?.data?.message || "שגיאה בעיבוד התשלום. אנא נסה שוב מאוחר יותר.";
        setError(errorMessage);
      } else {
        setError("שגיאה בעיבוד התשלום. אנא נסה שוב מאוחר יותר.");
      }
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="checkout-loading">טוען את פרטי התשלום...</div>;
  }

  if (error && !cart) {
    return <div className="checkout-error">{error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>הסל שלך ריק</h2>
        <button onClick={() => navigate("/products")} className="continue-shopping-btn">
          המשך לקניות
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">תשלום</h1>
      
      <div className="checkout-content">
        <div className="checkout-summary">
          <h2>סיכום הזמנה</h2>
          <div className="order-items">
            {cart.items.map((item) => (
              <div key={item.productId._id} className="order-item">
                <div className="order-item-image">
                  <img
                    src={item.productId.img || "/clinic/logo.jpg"}
                    alt={item.productId.name}
                  />
                </div>
                <div className="order-item-details">
                  <h3>{item.productId.name}</h3>
                  <p>כמות: {item.quantity}</p>
                  <p className="order-item-price">
                    מחיר: {item.productId.price * item.quantity} ₪
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <div className="total-row">
              <span>סה"כ מוצרים:</span>
              <span>
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="total-row final">
              <span>סה"כ לתשלום:</span>
              <span>{calculateTotal().toFixed(2)} ₪</span>
            </div>
          </div>
        </div>

        <div className="checkout-form-container">
          <h2>פרטי תשלום</h2>
          <form onSubmit={handlePayment} className="checkout-form">
            <div className="form-group">
              <label htmlFor="cardholderName">שם בעל הכרטיס:</label>
              <input
                type="text"
                id="cardholderName"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                required
                disabled={processing}
                placeholder="הזן את שמך המלא"
              />
            </div>

            <div className="payment-info">
              <p className="mock-payment-notice">
                💳 זהו תשלום סימולציה לצורך בדיקה. לא יתבצע חיוב אמיתי.
              </p>
            </div>

            {error && <div className="checkout-error-message">{error}</div>}

            <div className="checkout-actions">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="back-to-cart-btn"
                disabled={processing}
              >
                חזרה לסל
              </button>
              <button
                type="submit"
                className="pay-btn"
                disabled={processing || !cardholderName.trim()}
              >
                {processing ? "מעבד תשלום..." : `שלם ${calculateTotal().toFixed(2)} ₪`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
