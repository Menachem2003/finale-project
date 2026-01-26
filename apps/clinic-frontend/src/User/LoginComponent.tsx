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
      console.error(
        "Login error:",
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data
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
