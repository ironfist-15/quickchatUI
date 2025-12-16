import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MIN_PASSWORD_LENGTH = 6;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!username.trim()) {
      return "Username is required.";
    }
    if (!password) {
      return "Password is required.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password !== confirm) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Unable to reach server. Please try again.");
      }

      const data = await res.json();
      if (data.userId || data.message === "User registered successfully") {
        navigate("/");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-inner">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">
              Choose a username your friends can easily find, then set a secure
              password.
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                placeholder="your.username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="link"
                style={{ fontSize: "0.8rem", alignSelf: "flex-end" }}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </div>

            <div className="field">
              <label htmlFor="register-confirm">Confirm password</label>
              <input
                id="register-confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Re‑enter password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <span
                className="link"
                style={{ fontSize: "0.8rem", alignSelf: "flex-end" }}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? "Hide password" : "Show password"}
              </span>
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="form-footer">
              <span>
                Already have an account?{" "}
                <span
                  className="link"
                  onClick={() => navigate("/")}
                >
                  Sign in
                </span>
              </span>
              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}