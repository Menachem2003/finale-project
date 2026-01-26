import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { Link } from "react-router-dom";

interface Service {
  _id: string;
  name: string;
  description?: string;
  img?: string;
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get("services");
        setServices(data.data || []);
        console.log("data from server:", data);
        setError("");
      } catch (err: unknown) {
        console.error("Failed to fetch services", err);
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 404
        ) {
          setError("Services not found");
        } else if (err instanceof Error && err.message === "Network Error") {
          setError("check server");
        } else {
          setError(
            "An error occurred while loading services. Please try again later"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  console.log(services);

  return (
    <div className="services-section">
      <h2 className="section-title">השירותים שלנו</h2>

      {loading && <p>טוען שירותים...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="cards-container">
        {services.map((service) => (
          <Link to="/contact" key={service._id} className="service-card-link">
            <div className="services-card">
              <h3 className="service-title">{service.name}</h3>
              <p className="services-description">{service.description}</p>
              <img
                src={service.img}
                alt={service.name}
                className="services-img"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
