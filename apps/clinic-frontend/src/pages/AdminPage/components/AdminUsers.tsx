import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { User } from "@clinic/shared";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data || []);
    } catch (err) {
      setError("אחזור משתמשים נכשל");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "user" | "admin") => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? data : u))
      );
      alert("תפקיד המשתמש עודכן בהצלחה!");
    } catch (err: unknown) {
      console.error("Error updating role:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "עדכון התפקיד נכשל";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${userName}?`)) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      alert("המשתמש נמחק בהצלחה!");
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "מחיקת המשתמש נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-loading">
        <p>טוען משתמשים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-users-section">
      <h2 className="admin-users-title">ניהול משתמשים וצוות</h2>

      <div className="admin-users-table-container">
        <table className="admin-users-table">
          <thead className="admin-users-table-header">
            <tr>
              <th className="admin-users-table-th">שם</th>
              <th className="admin-users-table-th">אימייל</th>
              <th className="admin-users-table-th">תפקיד</th>
              <th className="admin-users-table-th">תאריך הרשמה</th>
              <th className="admin-users-table-th">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                  אין משתמשים להצגה
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="admin-users-table-row">
                  <td className="admin-users-table-cell">{user.name}</td>
                  <td className="admin-users-table-cell">{user.email}</td>
                  <td className="admin-users-table-cell">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUpdateRole(user._id, e.target.value as "user" | "admin")
                      }
                      className="add-product-select"
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        border: "1px solid #d1d5db",
                        backgroundColor:
                          user.role === "admin" ? "#dbeafe" : "#f3f4f6",
                        color: user.role === "admin" ? "#1e40af" : "#374151",
                        fontWeight: "500",
                        fontSize: "0.875rem",
                      }}
                    >
                      <option value="user">משתמש</option>
                      <option value="admin">מנהל</option>
                    </select>
                  </td>
                  <td className="admin-users-table-cell">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("he-IL")
                      : "-"}
                  </td>
                  <td className="admin-users-table-cell">
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="product-card-delete-button"
                      title="מחק משתמש"
                      style={{ fontSize: "1.125rem", cursor: "pointer", border: "none", background: "none" }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem" }}>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
          <strong>סה"כ משתמשים:</strong> {users.length} |{" "}
          <strong>מנהלים:</strong> {users.filter((u) => u.role === "admin").length} |{" "}
          <strong>משתמשים רגילים:</strong>{" "}
          {users.filter((u) => u.role === "user").length}
        </p>
      </div>
    </div>
  );
}
