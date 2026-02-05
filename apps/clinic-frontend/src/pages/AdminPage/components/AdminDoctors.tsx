import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { Doctor } from "@clinic/shared";
import AddDoctorForm from "./AddDoctorForm";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctors");
      setDoctors(data || []);
    } catch (err) {
      setError("אחזור רופאים נכשל");
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (newDoctor: Omit<Doctor, "_id">) => {
    try {
      const { data } = await api.post("/doctors", newDoctor);
      setDoctors((prev) => [data, ...prev]);
      setShowAddForm(false);
      alert("הרופא נוסף בהצלחה!");
    } catch (err: unknown) {
      console.error("Error adding doctor:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "הוספת הרופא נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const handleUpdateDoctor = async (
    doctorId: string,
    updatedData: Partial<Doctor>
  ) => {
    try {
      const { data } = await api.put(`/doctors/${doctorId}`, updatedData);
      setDoctors((prev) => prev.map((d) => (d._id === doctorId ? data : d)));
      setEditingDoctorId(null);
      alert("הרופא עודכן בהצלחה!");
    } catch (err: unknown) {
      console.error("Error updating doctor:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "עדכון הרופא נכשל";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק רופא זה?")) {
      return;
    }

    try {
      await api.delete(`/doctors/${doctorId}`);
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      alert("הרופא נמחק בהצלחה!");
    } catch (err: unknown) {
      console.error("Error deleting doctor:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "מחיקת הרופא נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const searchLower = searchTerm.toLowerCase();
    return doctor.name.toLowerCase().includes(searchLower);
  });

  if (loading) {
    return (
      <div className="admin-products-loading">
        <p>טוען רופאים...</p>
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

  const editingDoctor = editingDoctorId
    ? doctors.find((d) => d._id === editingDoctorId)
    : null;

  return (
    <div className="admin-products-section">
      <div className="admin-products-title" style={{ marginBottom: "1rem" }}>
        <h2>ניהול רופאים</h2>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginRight: "auto",
          }}
        >
          <input
            type="text"
            placeholder="חפש רופא..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-product-input"
            style={{ width: "250px" }}
          />
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingDoctorId(null);
            }}
            className="add-product-button"
          >
            {showAddForm ? "ביטול" : "הוסף רופא חדש"}
          </button>
        </div>
      </div>

      {showAddForm && !editingDoctorId && (
        <AddDoctorForm
          onAdd={handleAddDoctor}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingDoctorId && editingDoctor && (
        <AddDoctorForm
          initialData={editingDoctor}
          onUpdate={handleUpdateDoctor}
          onCancel={() => setEditingDoctorId(null)}
        />
      )}

      <div className="admin-products-table-container">
        <table className="admin-products-table">
          <thead className="admin-products-table-header">
            <tr>
              <th className="admin-products-table-th">תמונה</th>
              <th className="admin-products-table-th">שם</th>
              <th className="admin-products-table-th">תיאור</th>
              <th className="admin-products-table-th">התמחויות</th>
              <th className="admin-products-table-th">שעות עבודה</th>
              <th className="admin-products-table-th">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  {searchTerm
                    ? "לא נמצאו רופאים תואמים לחיפוש"
                    : "אין רופאים להצגה"}
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doctor) => (
                <tr key={doctor._id} className="product-row">
                  <td className="product-cell">
                    {doctor.img ? (
                      <img
                        src={doctor.img}
                        alt={doctor.name}
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
                          placeholder.textContent = doctor.name
                            .charAt(0)
                            .toUpperCase();
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
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="product-cell">{doctor.name}</td>
                  <td className="product-cell">
                    {doctor.description
                      ? doctor.description.length > 50
                        ? `${doctor.description.substring(0, 50)}...`
                        : doctor.description
                      : "-"}
                  </td>
                  <td className="product-cell">
                    {doctor.specialties && doctor.specialties.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.25rem",
                        }}
                      >
                        {doctor.specialties.map((spec, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#e0e7ff",
                              color: "#3730a3",
                              borderRadius: "0.25rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            {typeof spec === "object" && "specialtyName" in spec
                              ? spec.specialtyName
                              : String(spec)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="product-cell">
                    {doctor.workingHours && doctor.workingHours.length > 0 ? (
                      <div style={{ fontSize: "0.875rem" }}>
                        {doctor.workingHours.slice(0, 2).map((hour, idx) => (
                          <div key={idx}>
                            {hour.day}: {hour.workStart} - {hour.workEnd}
                          </div>
                        ))}
                        {doctor.workingHours.length > 2 && (
                          <div style={{ color: "#6b7280" }}>
                            +{doctor.workingHours.length - 2} עוד
                          </div>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="product-cell">
                    <div className="product-card-actions">
                      <button
                        onClick={() => {
                          setEditingDoctorId(doctor._id);
                          setShowAddForm(false);
                        }}
                        className="product-card-edit-button"
                        title="ערוך"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doctor._id)}
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
