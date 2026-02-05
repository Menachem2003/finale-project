import React, { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { Doctor, Specialty } from "@clinic/shared";

interface AddDoctorFormProps {
  onAdd: (doctor: Omit<Doctor, "_id">) => void;
  onUpdate?: (doctorId: string, doctor: Partial<Doctor>) => void;
  onCancel: () => void;
  initialData?: Doctor | null;
}

export default function AddDoctorForm({
  onAdd,
  onUpdate,
  onCancel,
  initialData,
}: AddDoctorFormProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    img: initialData?.img || "",
    description: initialData?.description || "",
    specialties: initialData?.specialties
      ? Array.isArray(initialData.specialties[0])
        ? (initialData.specialties as Array<{ _id: string }>).map((s) => s._id)
        : (initialData.specialties as string[])
      : [],
    workingHours: initialData?.workingHours || [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoadingSpecialties(true);
        const { data } = await api.get("/appointments/specialties");
        setSpecialties(data || []);
      } catch (err) {
        console.error("Failed to fetch specialties:", err);
        setError("שגיאה בטעינת התמחויות");
      } finally {
        setLoadingSpecialties(false);
      }
    };
    fetchSpecialties();
  }, []);

  const toggleSpecialty = (specialtyId: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter((id) => id !== specialtyId)
        : [...prev.specialties, specialtyId],
    }));
  };

  const addWorkingHour = () => {
    setFormData((prev) => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        { day: "", workStart: "", workEnd: "" },
      ],
    }));
  };

  const removeWorkingHour = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index),
    }));
  };

  const updateWorkingHour = (
    index: number,
    field: "day" | "workStart" | "workEnd",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((hour, i) =>
        i === index ? { ...hour, [field]: value } : hour
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("שם הרופא הוא שדה חובה");
      return;
    }

    if (formData.specialties.length === 0) {
      setError("יש לבחור לפחות התמחות אחת");
      return;
    }

    const doctorData = {
      name: formData.name.trim(),
      img: formData.img.trim() || undefined,
      description: formData.description.trim() || undefined,
      specialties: formData.specialties,
      workingHours: formData.workingHours.filter(
        (hour) => hour.day && hour.workStart && hour.workEnd
      ),
    };

    if (initialData && onUpdate) {
      onUpdate(initialData._id, doctorData);
    } else {
      onAdd(doctorData);
    }
  };

  const isEditMode = !!initialData;

  return (
    <div className="admin-products-section" style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>
        {isEditMode ? "ערוך רופא" : "הוסף רופא חדש"}
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
            placeholder="שם הרופא *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="add-product-input"
            required
            style={{ width: "100%" }}
          />
          <input
            type="text"
            placeholder="קישור לתמונה (אופציונלי)"
            value={formData.img}
            onChange={(e) => setFormData({ ...formData, img: e.target.value })}
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
              minHeight: "80px",
              resize: "vertical",
            }}
          />
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              התמחויות * (בחר לפחות אחת)
            </label>
            {loadingSpecialties ? (
              <p>טוען התמחויות...</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.25rem",
                  minHeight: "60px",
                }}
              >
                {specialties.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>אין התמחויות זמינות</p>
                ) : (
                  specialties.map((spec) => (
                    <label
                      key={spec._id}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "0.25rem",
                        border: formData.specialties.includes(spec._id)
                          ? "2px solid #16a34a"
                          : "1px solid #d1d5db",
                        backgroundColor: formData.specialties.includes(spec._id)
                          ? "#dcfce7"
                          : "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(spec._id)}
                        onChange={() => toggleSpecialty(spec._id)}
                        style={{ cursor: "pointer" }}
                      />
                      {spec.specialtyName}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <label style={{ fontWeight: "500" }}>
                שעות עבודה (אופציונלי)
              </label>
              <button
                type="button"
                onClick={addWorkingHour}
                className="category-edit-button"
                style={{ fontSize: "0.875rem", padding: "0.25rem 0.75rem" }}
              >
                הוסף יום
              </button>
            </div>
            {formData.workingHours.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                אין שעות עבודה. לחץ על "הוסף יום" כדי להוסיף.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {formData.workingHours.map((hour, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.25rem",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="יום (למשל: ראשון)"
                      value={hour.day}
                      onChange={(e) =>
                        updateWorkingHour(index, "day", e.target.value)
                      }
                      className="add-product-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="שעת התחלה (למשל: 09:00)"
                      value={hour.workStart}
                      onChange={(e) =>
                        updateWorkingHour(index, "workStart", e.target.value)
                      }
                      className="add-product-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="שעת סיום (למשל: 17:00)"
                      value={hour.workEnd}
                      onChange={(e) =>
                        updateWorkingHour(index, "workEnd", e.target.value)
                      }
                      className="add-product-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removeWorkingHour(index)}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <p className="add-product-error">{error}</p>}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <button type="submit" className="add-product-button">
              {isEditMode ? "עדכן רופא" : "הוסף רופא"}
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
