import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./OrderConfirmation.css";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    img?: string;
    description?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId?: string;
  paypalOrderId?: string;
  createdAt: string;
}

function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (err: unknown) {
        console.error("Failed to fetch order", err);
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 401
        ) {
          navigate("/login");
        } else if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 404
        ) {
          setError("ההזמנה לא נמצאה");
        } else {
          setError("שגיאה בטעינת פרטי ההזמנה");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return <div className="order-confirmation-loading">טוען את פרטי ההזמנה...</div>;
  }

  if (error) {
    return (
      <div className="order-confirmation-error">
        <h2>{error}</h2>
        <button onClick={() => navigate("/products")} className="continue-shopping-btn">
          חזרה למוצרים
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-error">
        <h2>ההזמנה לא נמצאה</h2>
        <button onClick={() => navigate("/products")} className="continue-shopping-btn">
          חזרה למוצרים
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "ממתין",
      completed: "הושלם",
      cancelled: "בוטל",
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "ממתין לתשלום",
      paid: "שולם",
      failed: "נכשל",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="order-confirmation-container">
      <div className="success-icon">✓</div>
      <h1 className="order-confirmation-title">תודה על הרכישה!</h1>
      <p className="order-confirmation-subtitle">ההזמנה שלך התקבלה בהצלחה</p>

      <div className="order-details">
        <div className="order-info-card">
          <h2>פרטי ההזמנה</h2>
          <div className="info-row">
            <span className="info-label">מספר הזמנה:</span>
            <span className="info-value">{order._id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">תאריך הזמנה:</span>
            <span className="info-value">{formatDate(order.createdAt)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">סטטוס הזמנה:</span>
            <span className={`info-value status-${order.status}`}>
              {getStatusText(order.status)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">סטטוס תשלום:</span>
            <span className={`info-value payment-${order.paymentStatus}`}>
              {getPaymentStatusText(order.paymentStatus)}
            </span>
          </div>
          {order.paypalOrderId && (
            <div className="info-row">
              <span className="info-label">מספר הזמנת PayPal:</span>
              <span className="info-value">{order.paypalOrderId}</span>
            </div>
          )}
          {order.transactionId && (
            <div className="info-row">
              <span className="info-label">מספר עסקה:</span>
              <span className="info-value">{order.transactionId}</span>
            </div>
          )}
          {order.paymentMethod && (
            <div className="info-row">
              <span className="info-label">אמצעי תשלום:</span>
              <span className="info-value">
                {order.paymentMethod === "paypal" ? "PayPal" : order.paymentMethod}
              </span>
            </div>
          )}
        </div>

        <div className="order-items-card">
          <h2>פריטים בהזמנה</h2>
          <div className="order-items-list">
            {order.items.map((item) => (
              <div key={item.productId._id} className="order-item-row">
                <div className="order-item-image">
                  <img
                    src={item.productId.img || "/clinic/logo.jpg"}
                    alt={item.productId.name}
                  />
                </div>
                <div className="order-item-info">
                  <h3>{item.productId.name}</h3>
                  <p>כמות: {item.quantity}</p>
                  <p className="order-item-price">
                    מחיר: {item.price * item.quantity} ₪
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span className="total-label">סה"כ לתשלום:</span>
            <span className="total-amount">{order.total.toFixed(2)} ₪</span>
          </div>
        </div>
      </div>

      <div className="order-confirmation-actions">
        <button
          onClick={() => navigate("/products")}
          className="continue-shopping-btn"
        >
          המשך לקניות
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;
