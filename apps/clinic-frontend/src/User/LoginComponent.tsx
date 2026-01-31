import { useContext, useState, FormEvent, ChangeEvent } from "react";
import "./Login.css";
import AuthContext from "../contexts/AuthContext";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

function LoginComponent() {
  const nav = useNavigate();
  const authContext = useContext(AuthContext);
  const { setUser } = authContext || { setUser: () => {} };
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError(false);

    try {
      const { data } = await api.post("auth/login", {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", data);
      if (setUser) {
        setUser(data.user);
      }
      localStorage.setItem("token", data.token);
      nav("/");
      setMessage("התחברת בהצלחה");
    } catch (error: unknown) {
      console.error("Login error:", error);
      
      let errorMessage = "נסה שוב מאוחר יותר";
      
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { status?: number; data?: { message?: string | string[] } } }).response;
        
        if (!response) {
          errorMessage = "לא ניתן להתחבר לשרת. אנא ודא שהשרת רץ.";
        } else if (response.status === 404) {
          errorMessage = "השרת לא נמצא. אנא ודא שהשרת רץ.";
        } else if (response.status === 401) {
          const message = response.data?.message;
          if (message) {
            errorMessage = Array.isArray(message) ? message.join(", ") : message;
          } else {
            errorMessage = "אימייל או סיסמה שגויים";
          }
        } else if (response.status === 400) {
          const message = response.data?.message;
          if (Array.isArray(message)) {
            errorMessage = `שגיאת אימות: ${message.join(", ")}`;
          } else if (message) {
            errorMessage = message;
          } else {
            errorMessage = "שגיאת אימות. אנא בדוק שכל השדות מולאו כראוי.";
          }
        } else if (response.status === 500) {
          errorMessage = "שגיאת שרת. אנא נסה שוב מאוחר יותר.";
        } else if (response.data?.message) {
          errorMessage = Array.isArray(response.data.message) 
            ? response.data.message.join(", ")
            : response.data.message;
        }
      } else if (error instanceof Error) {
        if (error.message.includes("Network Error") || error.message.includes("Failed to fetch")) {
          errorMessage = "לא ניתן להתחבר לשרת. אנא ודא שהשרת רץ.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessage(`שגיאת התחברות: ${errorMessage}`);
      setIsError(true);
    }
  };

  const { email, password } = formData;

  return (
    <div className="loginContainer">
      <div className="loginForm">
        <h2 className="title">התחברות</h2>
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="password" className="label">
              סיסמה
            </label>
            <input
              className="inputField"
              type="password"
              id="password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submitButton">
            התחבר
          </button>
        </form>
        {message && (
          <p className={`message ${isError ? "error" : "success"}`}>
            {message}
          </p>
        )}
        <div className="forgotPassword">
          <a href="/forgot-password">שכחתי סיסמה</a>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
