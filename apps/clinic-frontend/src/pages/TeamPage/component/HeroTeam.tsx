import { useState, useEffect } from "react";
import { api } from "../../../utils/api";
import type { TeamMember } from "@clinic/shared";

export default function HeroTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/team");
        const teamMembers = response.data || [];
        setTeam(teamMembers);
      } catch (err: unknown) {
        console.error("Failed to fetch team:", err);
        setError("שגיאה בטעינת הצוות. אנא נסה שוב מאוחר יותר.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

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
      <h1 className="title-team">הצוות שלנו</h1>

      <div className="team-list">
        {team.map((member) => (
          <div key={member._id} className="team-member">
            <div className="team-member-image-container">
              {member.img && member.img.trim() !== "" ? (
                <img
                  src={member.img}
                  alt={member.name}
                  className="team-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const container = target.parentElement;
                    if (container) {
                      const placeholder = document.createElement("div");
                      placeholder.className = "team-image-placeholder";
                      placeholder.textContent = member.name
                        .charAt(0)
                        .toUpperCase();
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
              {member.description ? (
                <p className="description">{member.description}</p>
              ) : (
                <p className="description no-description">אין תיאור זמין</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
