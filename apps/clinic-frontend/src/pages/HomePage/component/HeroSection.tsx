import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <div className="titel-picture">
      <img src="/clinic/hero-home.jpg" alt="dentisry" className="hero-home" />
      <div className="hero-content">
        <h1 className="home-title">ברוכים הבאים למרפאה עירונית מלכידנט</h1>
        <Link to="/contact">
          <button className="home-button">לקביעת תור</button>
        </Link>
      </div>
    </div>
  );
}
