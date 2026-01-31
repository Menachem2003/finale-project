import { useState, useEffect, useContext } from "react";
import { api } from "../../../utils/api";
import AuthContext from "../../../contexts/AuthContext";
import type { Specialty } from "@clinic/shared";

interface TeamMember {
  _id: string;
  name: string;
  img?: string;
  description?: string;
  specialties?: Array<{ _id: string; name: string }>;
  workingHours?: Array<{ day: string; workStart: string; workEnd: string }>;
}

export default function HeroTeam() {
  const authContext = useContext(AuthContext);
  const { user } = authContext || { user: null };
  const isAdmin = user?.role === "admin";

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    img: "",
    description: "",
    specialties: [] as string[],
    workingHours: [] as Array<{ day: string; workStart: string; workEnd: string }>,
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/doctors");
        const doctors = response.data || [];
        setTeam(doctors);
      } catch (err: unknown) {
        console.error("Failed to fetch team:", err);
        setError("שגיאה בטעינת הצוות. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  useEffect(() => {
    if (isAdmin && showAddForm) {
      const fetchSpecialties = async () => {
        try {
          const response = await api.get("/appointments/specialties");
          setSpecialties(response.data || []);
        } catch (err) {
          console.error("Failed to fetch specialties:", err);
        }
      };
      fetchSpecialties();
    }
  }, [isAdmin, showAddForm]);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("שם הוא שדה חובה");
      return;
    }

    if (formData.specialties.length === 0) {
      setFormError("יש לבחור לפחות התמחות אחת");
      return;
    }

    try {
      const { data } = await api.post("/doctors", formData);
      setTeam((prev) => [data, ...prev]);
      setFormData({
        name: "",
        img: "",
        description: "",
        specialties: [],
        workingHours: [],
      });
      setShowAddForm(false);
      alert("העובד נוסף בהצלחה!");
    } catch (err: unknown) {
      console.error("Error adding doctor:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "הוספת העובד נכשלה";
      setFormError(errorMessage);
    }
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${doctorName}?`)) {
      return;
    }

    try {
      await api.delete(`/doctors/${doctorId}`);
      setTeam((prev) => prev.filter((d) => d._id !== doctorId));
      alert("העובד נמחק בהצלחה!");
    } catch (err: unknown) {
      console.error("Error deleting doctor:", err);
      const errorMessage =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response: { data: { message: string } } }).response.data.message
          : "מחיקת העובד נכשלה";
      alert(`שגיאה: ${errorMessage}`);
    }
  };

  const toggleSpecialty = (specialtyId: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter((id) => id !== specialtyId)
        : [...prev.specialties, specialtyId],
    }));
  };

  if (loading) {
    return (
      <div className="container-team">
        <h1 className="title-team">הצוות שלנו</h1>
        <div className="team-loading">טוען את הצוות...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-team">
        <h1 className="title-team">הצוות שלנו</h1>
        <div className="team-error">{error}</div>
      </div>
    );
  }

  if (team.length === 0) {
    return (
      <div className="container-team">
        <h1 className="title-team">הצוות שלנו</h1>
        <div className="team-empty">אין חברי צוות זמינים כרגע</div>
      </div>
    );
  }

  return (
    <div className="container-team">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="title-team">הצוות שלנו</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            {showAddForm ? "ביטול" : "הוסף עובד חדש"}
          </button>
        )}
      </div>

      {isAdmin && showAddForm && (
        <div style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#f9fafb", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
          <h3 style={{ marginBottom: "1rem" }}>הוסף עובד חדש</h3>
          <form onSubmit={handleAddDoctor}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="text"
                placeholder="שם העובד *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #d1d5db" }}
              />
              <input
                type="text"
                placeholder="קישור לתמונה (אופציונלי)"
                value={formData.img}
                onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #d1d5db" }}
              />
              <textarea
                placeholder="תיאור (אופציונלי)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #d1d5db", minHeight: "80px" }}
              />
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  התמחויות * (בחר לפחות אחת)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {specialties.map((spec) => (
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
                  ))}
                </div>
              </div>
              {formError && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{formError}</p>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  הוסף עובד
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError("");
                    setFormData({
                      name: "",
                      img: "",
                      description: "",
                      specialties: [],
                      workingHours: [],
                    });
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                  }}
                >
                  ביטול
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="team-list">
        {team.map((member) => (
          <div key={member._id} className="team-member">
            <div className="team-member-image-container">
              {member.img && member.img.trim() !== '' ? (
                <img 
                  src={member.img} 
                  alt={member.name} 
                  className="team-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const container = target.parentElement;
                    if (container) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'team-image-placeholder';
                      placeholder.textContent = member.name.charAt(0).toUpperCase();
                      container.appendChild(placeholder);
                    }
                  }}
                />
              ) : (
                <div className="team-image-placeholder">
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="team-member-content">
              <h2 className="team-member-name">{member.name}</h2>
              {member.specialties && member.specialties.length > 0 && (
                <div className="team-specialties">
                  {member.specialties.map((spec, idx) => (
                    <span key={spec._id || idx} className="specialty-badge">
                      {typeof spec === 'object' && 'name' in spec ? spec.name : String(spec)}
                    </span>
                  ))}
                </div>
              )}
              {member.description ? (
                <div className="team-description">
                  <h3 className="description-title">אודות</h3>
                  <p className="description">{member.description}</p>
                </div>
              ) : (
                <div className="team-description">
                  <p className="description no-description">אין תיאור זמין</p>
                </div>
              )}
              {member.workingHours && member.workingHours.length > 0 && (
                <div className="team-hours">
                  <strong>שעות עבודה:</strong>
                  <div className="working-hours-list">
                    {member.workingHours.map((hour, idx) => (
                      <span key={idx} className="working-hour">
                        {hour.day}: {hour.workStart} - {hour.workEnd}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {isAdmin && (
              <div style={{ marginTop: "1rem" }}>
                <button
                  onClick={() => handleDeleteDoctor(member._id, member.name)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "0.25rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  מחק עובד
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
