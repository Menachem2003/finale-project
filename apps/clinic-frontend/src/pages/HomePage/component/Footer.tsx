import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h2>צור קשר</h2>
          <p>כתובת: קריית הממשלה קומה 2 רמלה</p>
          <p>טלפון: 03-1234567</p>
          <p>אימייל: info@dentalsite.com</p>
        </div>

        <div className="footer-section">
          <h2>שעות פעילות</h2>
          <p>ראשון - חמישי: 9:00 - 18:00</p>
          <p>שישי: 9:00 - 14:00</p>
          <p>שבת: סגור</p>
        </div>

        <div className="footer-section">
          <h2>קישורים מהירים</h2>
          <ul>
            <li>
              <a href="/services">שירותים</a>
            </li>
            <li>
              <a href="/contact">צור קשר</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          &copy; {new Date().getFullYear()} כל הזכויות שמורות
        </p>
      </div>
    </footer>
  );
};

export default Footer;
