import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { Order, Product, User } from "@clinic/shared";

interface PopulatedOrder extends Omit<Order, "userId" | "items"> {
  userId: User | string;
  items: Array<{
    productId: Product | string;
    quantity: number;
    price: number;
  }>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<PopulatedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/orders/all");
      setOrders(data || []);
    } catch (err) {
      setError("אחזור רכישות נכשל");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: User | string): string => {
    if (typeof userId === "string") return userId;
    return userId.name || userId.email || "לא ידוע";
  };

  const getUserEmail = (userId: User | string): string => {
    if (typeof userId === "string") return "";
    return userId.email || "";
  };

  const getProductName = (productId: Product | string): string => {
    if (typeof productId === "string") return productId;
    return productId.name || "מוצר לא ידוע";
  };

  const getProductsSummary = (
    items: Array<{
      productId: Product | string;
      quantity: number;
      price: number;
    }>
  ): string => {
    if (items.length === 0) return "אין מוצרים";
    if (items.length === 1) {
      const productName = getProductName(items[0].productId);
      return `${productName} (${items[0].quantity}x)`;
    }
    return `${items.length} מוצרים`;
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const userName = getUserName(order.userId).toLowerCase();
    const userEmail = getUserEmail(order.userId).toLowerCase();
    const orderId = order._id.toLowerCase();
    const status = order.status.toLowerCase();
    const paymentStatus = order.paymentStatus.toLowerCase();

    return (
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      orderId.includes(searchLower) ||
      status.includes(searchLower) ||
      paymentStatus.includes(searchLower) ||
      getProductsSummary(order.items).toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "#dcfce7", color: "#166534", label: "הושלם" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e", label: "ממתין" };
      case "cancelled":
        return { bg: "#fee2e2", color: "#991b1b", label: "בוטל" };
      default:
        return { bg: "#f3f4f6", color: "#374151", label: status };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "#dcfce7", color: "#166534", label: "שולם" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e", label: "ממתין לתשלום" };
      case "failed":
        return { bg: "#fee2e2", color: "#991b1b", label: "נכשל" };
      default:
        return { bg: "#f3f4f6", color: "#374151", label: status };
    }
  };

  if (loading) {
    return (
      <div className="admin-referrals-loading">
        <p>טוען רכישות...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-referrals-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-referrals-section">
      <div
        className="admin-referrals-title"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>ניהול רכישות</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="חפש רכישות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-product-input"
            style={{ width: "250px" }}
          />
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            סה"כ: {filteredOrders.length}
          </span>
        </div>
      </div>

      <div className="admin-referrals-table-container">
        <table className="admin-referrals-table">
          <thead className="admin-referrals-table-header">
            <tr>
              <th className="admin-referrals-table-th">תאריך</th>
              <th className="admin-referrals-table-th">לקוח</th>
              <th className="admin-referrals-table-th">מוצרים</th>
              <th className="admin-referrals-table-th">סכום</th>
              <th className="admin-referrals-table-th">סטטוס תשלום</th>
              <th className="admin-referrals-table-th">סטטוס הזמנה</th>
              <th className="admin-referrals-table-th">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  {searchTerm
                    ? "לא נמצאו רכישות תואמות לחיפוש"
                    : "אין רכישות להצגה"}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const statusStyle = getStatusColor(order.status);
                const paymentStatusStyle = getPaymentStatusColor(
                  order.paymentStatus
                );
                return (
                  <tr key={order._id} className="admin-referrals-table-row">
                    <td className="admin-referrals-table-cell">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "he-IL",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </td>
                    <td className="admin-referrals-table-cell">
                      <div>
                        <div>{getUserName(order.userId)}</div>
                        {getUserEmail(order.userId) && (
                          <div
                            style={{ fontSize: "0.875rem", color: "#6b7280" }}
                          >
                            {getUserEmail(order.userId)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="admin-referrals-table-cell">
                      {getProductsSummary(order.items)}
                    </td>
                    <td className="admin-referrals-table-cell">
                      ₪{order.total.toFixed(2)}
                    </td>
                    <td className="admin-referrals-table-cell">
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          backgroundColor: paymentStatusStyle.bg,
                          color: paymentStatusStyle.color,
                        }}
                      >
                        {paymentStatusStyle.label}
                      </span>
                    </td>
                    <td className="admin-referrals-table-cell">
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="admin-referrals-table-cell">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="category-edit-button"
                        style={{
                          fontSize: "0.875rem",
                          padding: "0.25rem 0.75rem",
                        }}
                      >
                        צפה בפרטים
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: "2rem",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              direction: "rtl",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
                פרטי הרכישה
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <strong>מספר הזמנה:</strong> {selectedOrder._id}
              </div>
              <div>
                <strong>לקוח:</strong> {getUserName(selectedOrder.userId)}
                {getUserEmail(selectedOrder.userId) && (
                  <> ({getUserEmail(selectedOrder.userId)})</>
                )}
              </div>
              <div>
                <strong>תאריך:</strong>{" "}
                {selectedOrder.createdAt
                  ? new Date(selectedOrder.createdAt).toLocaleString("he-IL")
                  : "-"}
              </div>
              <div>
                <strong>סטטוס תשלום:</strong>{" "}
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    ...getPaymentStatusColor(selectedOrder.paymentStatus),
                  }}
                >
                  {getPaymentStatusColor(selectedOrder.paymentStatus).label}
                </span>
              </div>
              <div>
                <strong>סטטוס הזמנה:</strong>{" "}
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    ...getStatusColor(selectedOrder.status),
                  }}
                >
                  {getStatusColor(selectedOrder.status).label}
                </span>
              </div>
              {selectedOrder.transactionId && (
                <div>
                  <strong>מספר עסקה:</strong> {selectedOrder.transactionId}
                </div>
              )}
              <div>
                <strong>אמצעי תשלום:</strong>{" "}
                {selectedOrder.paymentMethod || "לא צוין"}
              </div>
              <div>
                <strong>מוצרים:</strong>
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "1rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.25rem",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <th style={{ padding: "0.5rem", textAlign: "right" }}>
                          מוצר
                        </th>
                        <th style={{ padding: "0.5rem", textAlign: "right" }}>
                          כמות
                        </th>
                        <th style={{ padding: "0.5rem", textAlign: "right" }}>
                          מחיר יחידה
                        </th>
                        <th style={{ padding: "0.5rem", textAlign: "right" }}>
                          סה"כ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid #e5e7eb" }}
                        >
                          <td style={{ padding: "0.5rem" }}>
                            {getProductName(item.productId)}
                          </td>
                          <td style={{ padding: "0.5rem" }}>{item.quantity}</td>
                          <td style={{ padding: "0.5rem" }}>
                            ₪{item.price.toFixed(2)}
                          </td>
                          <td style={{ padding: "0.5rem" }}>
                            ₪{(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            padding: "0.5rem",
                            textAlign: "left",
                            fontWeight: "700",
                          }}
                        >
                          סה"כ:
                        </td>
                        <td style={{ padding: "0.5rem", fontWeight: "700" }}>
                          ₪{selectedOrder.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                className="category-edit-button"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
