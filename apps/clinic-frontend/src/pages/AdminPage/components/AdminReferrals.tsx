import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { Referral } from "@clinic/shared";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/referrals");
      setReferrals(data || []);
    } catch (err) {
      setError("אחזור פניות נכשל");
      console.error("Error fetching referrals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (referralId: string, newStatus: "new" | "read" | "responded") => {
    try {
      const { data } = await api.put(`/referrals/${referralId}/status`, { status: newStatus });
      setReferrals((prev) =>
        prev.map((r) => (r._id === referralId ? data : r))
      );
      if (selectedReferral && selectedReferral._id === referralId) {
        setSelectedReferral(data);
      }
    } catch (err: unknown) {
      console.error("Error updating status:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "עדכון הסטטוס נכשל";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const filteredReferrals = referrals.filter((referral) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      referral.fullName.toLowerCase().includes(searchLower) ||
      referral.email.toLowerCase().includes(searchLower) ||
      referral.phone.includes(searchTerm) ||
      referral.reason.toLowerCase().includes(searchLower) ||
      referral.content.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return { bg: "#dbeafe", color: "#1e40af", label: "חדש" };
      case "read":
        return { bg: "#f3f4f6", color: "#374151", label: "נקרא" };
      case "responded":
        return { bg: "#dcfce7", color: "#166534", label: "טופל" };
      default:
        return { bg: "#f3f4f6", color: "#374151", label: status };
    }
  };

  if (loading) {
    return (
      <div className="admin-referrals-loading">
        <p>טוען פניות...</p>
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
      <div className="admin-referrals-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>ניהול פניות</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="חפש פניות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-product-input"
            style={{ width: "250px" }}
          />
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            סה"כ: {filteredReferrals.length}
          </span>
        </div>
      </div>

      <div className="admin-referrals-table-container">
        <table className="admin-referrals-table">
          <thead className="admin-referrals-table-header">
            <tr>
              <th className="admin-referrals-table-th">שם מלא</th>
              <th className="admin-referrals-table-th">אימייל</th>
              <th className="admin-referrals-table-th">טלפון</th>
              <th className="admin-referrals-table-th">נושא</th>
              <th className="admin-referrals-table-th">תאריך</th>
              <th className="admin-referrals-table-th">סטטוס</th>
              <th className="admin-referrals-table-th">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                  {searchTerm ? "לא נמצאו פניות תואמות לחיפוש" : "אין פניות להצגה"}
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral) => {
                const statusStyle = getStatusColor(referral.status);
                return (
                  <tr key={referral._id} className="admin-referrals-table-row">
                    <td className="admin-referrals-table-cell">{referral.fullName}</td>
                    <td className="admin-referrals-table-cell">{referral.email}</td>
                    <td className="admin-referrals-table-cell">{referral.phone}</td>
                    <td className="admin-referrals-table-cell">
                      {referral.reason.length > 30
                        ? `${referral.reason.substring(0, 30)}...`
                        : referral.reason}
                    </td>
                    <td className="admin-referrals-table-cell">
                      {referral.createdAt
                        ? new Date(referral.createdAt).toLocaleDateString("he-IL", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="admin-referrals-table-cell">
                      <select
                        value={referral.status}
                        onChange={(e) =>
                          handleUpdateStatus(
                            referral._id,
                            e.target.value as "new" | "read" | "responded"
                          )
                        }
                        className="add-product-select"
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "1px solid #d1d5db",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: "500",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                        }}
                      >
                        <option value="new">חדש</option>
                        <option value="read">נקרא</option>
                        <option value="responded">טופל</option>
                      </select>
                    </td>
                    <td className="admin-referrals-table-cell">
                      <button
                        onClick={() => setSelectedReferral(referral)}
                        className="category-edit-button"
                        style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
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

      {selectedReferral && (
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
          onClick={() => setSelectedReferral(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              direction: "rtl",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
                פרטי הפנייה
              </h3>
              <button
                onClick={() => setSelectedReferral(null)}
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

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <strong>שם מלא:</strong> {selectedReferral.fullName}
              </div>
              <div>
                <strong>אימייל:</strong> {selectedReferral.email}
              </div>
              <div>
                <strong>טלפון:</strong> {selectedReferral.phone}
              </div>
              <div>
                <strong>נושא:</strong> {selectedReferral.reason}
              </div>
              <div>
                <strong>הודעה:</strong>
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "1rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.25rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedReferral.content}
                </div>
              </div>
              <div>
                <strong>תאריך:</strong>{" "}
                {selectedReferral.createdAt
                  ? new Date(selectedReferral.createdAt).toLocaleString("he-IL")
                  : "-"}
              </div>
              <div>
                <strong>סטטוס:</strong>{" "}
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    ...getStatusColor(selectedReferral.status),
                  }}
                >
                  {getStatusColor(selectedReferral.status).label}
                </span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <select
                value={selectedReferral.status}
                onChange={(e) =>
                  handleUpdateStatus(
                    selectedReferral._id,
                    e.target.value as "new" | "read" | "responded"
                  )
                }
                className="add-product-select"
                style={{ flex: 1 }}
              >
                <option value="new">חדש</option>
                <option value="read">נקרא</option>
                <option value="responded">טופל</option>
              </select>
              <button
                onClick={() => setSelectedReferral(null)}
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
