import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./Checkout.css";
import type { Order, PayPalSDK, PayPalApproveData, PayPalActions, PayPalError } from "@clinic/shared";

declare global {
  interface Window {
    paypal?: PayPalSDK;
  }
}

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
  const [order, setOrder] = useState<Order | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalSDKLoaded, setPaypalSDKLoaded] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPayPalSDK = async (): Promise<boolean> => {
      if (window.paypal) {
        setPaypalSDKLoaded(true);
        return true;
      }

      const clientId: string | undefined = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      if (
        !clientId ||
        clientId === "YOUR_CLIENT_ID" ||
        clientId === "your_paypal_client_id" ||
        clientId.trim() === ""
      ) {
        console.warn(
          "PayPal Client ID not configured - PayPal payment will not be available",
        );
        return false;
      }

      return new Promise<boolean>((resolve) => {
        // Check if script already exists
        const existingScript = document.querySelector(
          `script[src*="paypal.com/sdk"]`,
        );
        if (existingScript) {
          if (window.paypal) {
            setPaypalSDKLoaded(true);
            resolve(true);
            return;
          }
          // Wait a bit for existing script to load
          setTimeout(() => {
            if (window.paypal) {
              setPaypalSDKLoaded(true);
              resolve(true);
            } else {
              resolve(false);
            }
          }, 1000);
          return;
        }

        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=ILS`;
        script.async = true;
        script.onload = () => {
          setPaypalSDKLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load PayPal SDK");
          setError("שגיאה בטעינת PayPal SDK. אנא בדוק את החיבור לאינטרנט.");
          resolve(false);
        };
        document.head.appendChild(script);
      });
    };

    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load PayPal SDK first
        await loadPayPalSDK();

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
        if (err && typeof err === "object" && "response" in err) {
          const response = err as {
            response?: { status?: number; data?: { message?: string } };
          };

          if (response.response?.status === 401) {
            navigate("/login");
            return;
          }

          const errorMessage =
            response.response?.data?.message || "שגיאה בטעינת הסל";
          setError(errorMessage);
        } else {
          setError("שגיאה בטעינת הסל. אנא נסה שוב מאוחר יותר.");
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
      0,
    );
  };

  useEffect(() => {
    const initializePayPal = async () => {
      if (!order || !paypalOrderId || !paypalSDKLoaded || !window.paypal) {
        return;
      }

      // Clear existing buttons
      if (paypalButtonRef.current) {
        paypalButtonRef.current.innerHTML = "";
      }

      try {
        window.paypal
          .Buttons({
            createOrder: () => {
              if (!paypalOrderId) {
                throw new Error("PayPal order ID is missing");
              }
              return paypalOrderId;
            },
            onApprove: async (_data: PayPalApproveData, _actions: PayPalActions) => {
              try {
                setProcessing(true);
                const token = localStorage.getItem("token");
                if (!token) {
                  navigate("/login");
                  return;
                }

                // Capture the payment
                const captureResponse = await api.post(
                  `/orders/${order._id}/payment/capture`,
                  { paypalOrderId },
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  },
                );

                if (captureResponse.data.success) {
                  // Clear cart
                  await api.delete("/cart", {
                    headers: { Authorization: `Bearer ${token}` },
                  });

                  // Redirect to order confirmation
                  navigate(`/orders/${order._id}`);
                } else {
                  setError(
                    captureResponse.data.message ||
                      "תהליך התשלום נכשל. אנא נסה שוב.",
                  );
                  setProcessing(false);
                }
              } catch (err: unknown) {
                console.error("Payment capture error:", err);
                setError("שגיאה בעיבוד התשלום. אנא נסה שוב מאוחר יותר.");
                setProcessing(false);
              }
            },
            onError: (err: PayPalError) => {
              console.error("PayPal error:", err);
              setError("שגיאה בתהליך התשלום של PayPal. אנא נסה שוב.");
              setProcessing(false);
            },
            onCancel: () => {
              setError("התשלום בוטל על ידי המשתמש.");
            },
          })
          .render(paypalButtonRef.current);
      } catch (err) {
        console.error("Error initializing PayPal:", err);
        setError("שגיאה בטעינת PayPal. אנא רענן את הדף.");
      }
    };

    initializePayPal();
  }, [order, paypalOrderId, paypalSDKLoaded, navigate]);

  const handleCreateOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      alert("הסל ריק");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Check if PayPal SDK is loaded
    const clientId: string | undefined = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (
      !clientId ||
      clientId === "YOUR_CLIENT_ID" ||
      clientId === "your_paypal_client_id" ||
      clientId.trim() === ""
    ) {
      setError(
        "PayPal לא מוגדר.\n\n" +
          "אנא פתח את קובץ .env בתיקיית השורש של הפרויקט והחלף את 'your_paypal_client_id' בערך האמיתי של PayPal Client ID שלך.\n\n" +
          "לקבלת PayPal Sandbox credentials:\n" +
          "1. היכנס ל-https://developer.paypal.com/\n" +
          "2. צור Sandbox Account\n" +
          "3. קבל Client ID מה-App שלך\n" +
          "4. החלף את הערך בקובץ .env\n" +
          "5. הפעל מחדש את שרת ה-frontend",
      );
      setProcessing(false);
      return;
    }

    if (!paypalSDKLoaded || !window.paypal) {
      setError(
        "PayPal SDK לא נטען. אנא רענן את הדף או בדוק את החיבור לאינטרנט.",
      );
      setProcessing(false);
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
        },
      );

      const createdOrder = createOrderResponse.data;
      setOrder(createdOrder);

      // Step 2: Create PayPal order
      const paypalOrderResponse = await api.post(
        `/orders/${createdOrder._id}/payment/create`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPaypalOrderId(paypalOrderResponse.data.paypalOrderId);
      setProcessing(false);
    } catch (err: unknown) {
      console.error("Order creation error:", err);

      if (err && typeof err === "object" && "response" in err) {
        const response = err as {
          response?: { status?: number; data?: { message?: string } };
        };

        if (response.response?.status === 401) {
          navigate("/login");
          return;
        }

        const errorMessage =
          response.response?.data?.message ||
          "שגיאה ביצירת ההזמנה. אנא נסה שוב מאוחר יותר.";
        setError(errorMessage);
      } else {
        setError("שגיאה ביצירת ההזמנה. אנא נסה שוב מאוחר יותר.");
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
        <button
          onClick={() => navigate("/products")}
          className="continue-shopping-btn"
        >
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
          <div className="checkout-form">
            {!order ? (
              <>
                <div className="payment-info">
                  <p className="paypal-notice">
                    💳 התשלום מתבצע דרך PayPal בצורה מאובטחת
                  </p>
                </div>

                {error && (
                  <div
                    className="checkout-error-message"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {error}
                  </div>
                )}

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
                    type="button"
                    onClick={handleCreateOrder}
                    className="pay-btn"
                    disabled={processing}
                  >
                    {processing
                      ? "יוצר הזמנה..."
                      : `המשך לתשלום ${calculateTotal().toFixed(2)} ₪`}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="payment-info">
                  <p className="paypal-notice">
                    אנא השלם באמצעות PayPal. התשלום מאובטח ומאומת.
                  </p>
                </div>

                {error && <div className="checkout-error-message">{error}</div>}

                <div
                  ref={paypalButtonRef}
                  className="paypal-button-container"
                ></div>

                <div className="checkout-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setOrder(null);
                      setPaypalOrderId(null);
                      setError(null);
                    }}
                    className="back-to-cart-btn"
                    disabled={processing}
                  >
                    חזרה
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
