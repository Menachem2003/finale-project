import React, { useState, FormEvent, ChangeEvent } from "react";
import "./Register.css";
import { api } from "../utils/api";

function RegisterComponent() {
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
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
      const { data } = await api.post("auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Registration successful:", data);
      setMessage("נרשמת בהצלחה");
    } catch (error: unknown) {
      console.error(
        "Registration error:",
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
          : "נסה שוב מאוחר יותר.";
      setMessage(`שגיאת הרשמה: ${errorMessage}`);
      setIsError(true);
    }
  };

  const { name, email, password } = formData;

  return (
    <div className="registerContainer">
      <div className="loginForm">
        <h2 className="title">הרשמה</h2>
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="name" className="label">
              שם משתמש
            </label>
            <input
              className="inputField"
              type="text"
              id="name"
              value={name}
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
            הירשם
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

export default RegisterComponent;
