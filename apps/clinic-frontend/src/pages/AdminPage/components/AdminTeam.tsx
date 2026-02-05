import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { TeamMember } from "@clinic/shared";

export default function AdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/team");
      setTeam(data || []);
    } catch (err) {
      setError("אחזור חברי צוות נכשל");
      console.error("Error fetching team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (newMember: Omit<TeamMember, "_id" | "createdAt" | "updatedAt">) => {
    try {
      const { data } = await api.post("/team", newMember);
      setTeam((prev) => [data, ...prev]);
      setShowAddForm(false);
      alert("חבר צוות נוסף בהצלחה!");
    } catch (err: unknown) {
      console.error("Error adding team member:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "הוספת חבר הצוות נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const handleUpdateMember = async (
    memberId: string,
    updatedData: Partial<TeamMember>
  ) => {
    try {
      const { data } = await api.put(`/team/${memberId}`, updatedData);
      setTeam((prev) =>
        prev.map((m) => (m._id === memberId ? data : m))
      );
      setEditingMemberId(null);
      alert("חבר הצוות עודכן בהצלחה!");
    } catch (err: unknown) {
      console.error("Error updating team member:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "עדכון חבר הצוות נכשל";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק חבר צוות זה?")) {
      return;
    }

    try {
      await api.delete(`/team/${memberId}`);
      setTeam((prev) => prev.filter((m) => m._id !== memberId));
      alert("חבר הצוות נמחק בהצלחה!");
    } catch (err: unknown) {
      console.error("Error deleting team member:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "מחיקת חבר הצוות נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const filteredTeam = team.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return member.name.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="admin-products-loading">
        <p>טוען חברי צוות...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products-error">
        <p>{error}</p>
      </div>
    );
  }

  const editingMember = editingMemberId
    ? team.find((m) => m._id === editingMemberId)
    : null;

  return (
    <div className="admin-products-section">
      <div className="admin-products-title" style={{ marginBottom: "1rem" }}>
        <h2>ניהול צוות</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginRight: "auto" }}>
          <input
            type="text"
            placeholder="חפש חבר צוות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-product-input"
            style={{ width: "250px" }}
          />
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingMemberId(null);
            }}
            className="add-product-button"
          >
            {showAddForm ? "ביטול" : "הוסף חבר צוות חדש"}
          </button>
        </div>
      </div>

      {showAddForm && !editingMemberId && (
        <TeamMemberForm
          onAdd={handleAddMember}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingMemberId && editingMember && (
        <TeamMemberForm
          initialData={editingMember}
          onUpdate={handleUpdateMember}
          onCancel={() => setEditingMemberId(null)}
        />
      )}

      <div className="admin-products-table-container">
        <table className="admin-products-table">
          <thead className="admin-products-table-header">
            <tr>
              <th className="admin-products-table-th">תמונה</th>
              <th className="admin-products-table-th">שם</th>
              <th className="admin-products-table-th">תיאור</th>
              <th className="admin-products-table-th">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeam.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                  {searchTerm ? "לא נמצאו חברי צוות תואמים לחיפוש" : "אין חברי צוות להצגה"}
                </td>
              </tr>
            ) : (
              filteredTeam.map((member) => (
                <tr key={member._id} className="product-row">
                  <td className="product-cell">
                    {member.img ? (
                      <img
                        src={member.img}
                        alt={member.name}
                        className="product-card-image"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const placeholder = document.createElement("div");
                          placeholder.style.cssText =
                            "width: 60px; height: 60px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #6b7280;";
                          placeholder.textContent = member.name.charAt(0).toUpperCase();
                          target.parentElement?.appendChild(placeholder);
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          background: "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          color: "#6b7280",
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="product-cell">{member.name}</td>
                  <td className="product-cell">
                    {member.description
                      ? member.description.length > 100
                        ? `${member.description.substring(0, 100)}...`
                        : member.description
                      : "-"}
                  </td>
                  <td className="product-cell">
                    <div className="product-card-actions">
                      <button
                        onClick={() => {
                          setEditingMemberId(member._id);
                          setShowAddForm(false);
                        }}
                        className="product-card-edit-button"
                        title="ערוך"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member._id)}
                        className="product-card-delete-button"
                        title="מחק"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TeamMemberFormProps {
  onAdd?: (member: Omit<TeamMember, "_id" | "createdAt" | "updatedAt">) => void;
  onUpdate?: (memberId: string, member: Partial<TeamMember>) => void;
  onCancel: () => void;
  initialData?: TeamMember | null;
}

function TeamMemberForm({
  onAdd,
  onUpdate,
  onCancel,
  initialData,
}: TeamMemberFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    img: initialData?.img || "",
    description: initialData?.description || "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("שם הוא שדה חובה");
      return;
    }

    const memberData = {
      name: formData.name.trim(),
      img: formData.img.trim() || undefined,
      description: formData.description.trim() || undefined,
    };

    if (initialData && onUpdate) {
      onUpdate(initialData._id, memberData);
    } else if (onAdd) {
      onAdd(memberData);
    }
  };

  const isEditMode = !!initialData;

  return (
    <div className="admin-products-section" style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>
        {isEditMode ? "ערוך חבר צוות" : "הוסף חבר צוות חדש"}
      </h3>
      <form onSubmit={handleSubmit} className="add-product-form">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="שם *"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="add-product-input"
            required
            style={{ width: "100%" }}
          />
          <input
            type="text"
            placeholder="קישור לתמונה (אופציונלי)"
            value={formData.img}
            onChange={(e) =>
              setFormData({ ...formData, img: e.target.value })
            }
            className="add-product-input"
            style={{ width: "100%" }}
          />
          <textarea
            placeholder="תיאור (אופציונלי)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="add-product-input"
            style={{
              width: "100%",
              minHeight: "120px",
              resize: "vertical",
            }}
          />
          {error && <p className="add-product-error">{error}</p>}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <button type="submit" className="add-product-button">
              {isEditMode ? "עדכן" : "הוסף"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="category-edit-button"
            >
              ביטול
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
