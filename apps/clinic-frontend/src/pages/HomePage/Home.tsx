import Middlehome from "./component/MiddleHome";
import HeroSection from "./component/HeroSection";
import ServicesSection from "./component/ServicesSection";
import Footer from "./component/Footer";
import "./Home.css";

function Home() {
  return (
    <div className="container">
      <HeroSection />
      <ServicesSection />
      <Middlehome />
      <Footer />
    </div>
  );
}

export default Home;
