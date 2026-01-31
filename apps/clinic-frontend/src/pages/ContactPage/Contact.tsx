import { useState, FormEvent, ChangeEvent } from "react";
import "./Contact.css";
import { api } from "../../utils/api";

function Contact() {
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/contact", formData);

      console.log("Contact form sent:", data);
      setMessage("הפנייה נשלחה בהצלחה ונשמרה במערכת! נציג המרפאה יחזור אליך בהקדם.");
      setIsError(false);

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        reason: "",
        content: "",
      });
    } catch (error: unknown) {
      setIsSubmitting(false);
      console.error(
        "Contact form error:",
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : error instanceof Error
          ? error.message
          : "Unknown error"
      );
      let errorMessage = "נסה שוב מאוחר יותר";
      
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { status?: number; data?: { message?: string | string[] } } }).response;
        
        if (response?.status === 404) {
          errorMessage = "השרת לא נמצא. אנא ודא שהשרת רץ.";
        } else if (response?.status === 400) {
          const message = response.data?.message;
          if (Array.isArray(message)) {
            errorMessage = `שגיאת אימות: ${message.join(", ")}`;
          } else if (message) {
            errorMessage = message;
          } else {
            errorMessage = "שגיאת אימות. אנא בדוק שכל השדות מולאו כראוי.";
          }
        } else if (response?.status === 500) {
          errorMessage = "שגיאת שרת. אנא נסה שוב מאוחר יותר.";
        } else if (response?.data?.message) {
          errorMessage = Array.isArray(response.data.message) 
            ? response.data.message.join(", ")
            : response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setMessage(`שגיאה בשליחת הפנייה: ${errorMessage}`);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
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

          <button 
            type="submit" 
            className="submitButton"
            disabled={isSubmitting}
          >
            {isSubmitting ? "שולח..." : "שלח פנייה"}
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
