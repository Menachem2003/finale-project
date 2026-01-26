import { useState, useEffect } from "react";
import { api } from "../../../utils/api";

interface TeamMember {
  _id: string;
  name: string;
  img?: string;
  description?: string;
}

export default function HeroTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    api
      .get("/doctors")
      .then((res) => setTeam(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container-team">
      <h1 className="title-team">הצוות שלנו</h1>

      {team.map((member) => (
        <div key={member._id} className="team-member">
          <h2 className="team-member-name">{member.name}</h2>
          {member.img && (
            <img src={member.img} alt={member.name} className="team-image" />
          )}
          {member.description && (
            <p className="description">{member.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
