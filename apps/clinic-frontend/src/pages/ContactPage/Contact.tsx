import { useState, FormEvent, ChangeEvent } from "react";
import "./Contact.css";
import { api } from "../../utils/api";

function Contact() {
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    reason: "",
    content: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);

    try {
      const { data } = await api.post("/contact", formData);

      console.log("Contact form sent:", data);
      setMessage("הפנייה נשלחה בהצלחה! נציג המרפאה יחזור אליך בהקדם.");
      setIsError(false);

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        reason: "",
        content: "",
      });
    } catch (error: unknown) {
      console.error(
        "Contact form error:",
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : error instanceof Error
          ? error.message
          : "Unknown error"
      );
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : "נסה שוב מאוחר יותר";
      setMessage(`שגיאה בשליחת הפנייה: ${errorMessage}`);
      setIsError(true);
    }
  };

  const { fullName, email, phone, reason, content } = formData;

  return (
    <div className="contactContainer">
      <div className="contactForm">
        <h2 className="title">טופס פנייה למרפאת שיניים</h2>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="fullName" className="label">
              שם מלא
            </label>
            <input
              className="inputField"
              type="text"
              id="fullName"
              value={fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="email" className="label">
              אימייל
            </label>
            <input
              className="inputField"
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="phone" className="label">
              טלפון
            </label>
            <input
              className="inputField"
              type="tel"
              id="phone"
              value={phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="reason" className="label">
              נושא הפנייה
            </label>
            <input
              className="inputField"
              type="text"
              id="reason"
              value={reason}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="content" className="label">
              הודעה
            </label>
            <textarea
              className="inputField textareaField"
              id="content"
              value={content}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submitButton">
            שלח פנייה
          </button>
        </form>

        {message && (
          <p className={`message ${isError ? "error" : "success"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Contact;
