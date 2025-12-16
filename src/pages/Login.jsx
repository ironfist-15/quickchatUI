import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MIN_PASSWORD_LENGTH = 6;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Unable to reach server. Please try again.");
      }

      const data = await res.json();

      if (data.success) {
        const userId = data.userId || username.trim();
        navigate(`/${userId}/home`);
      } else {
        setError(data.message || "Invalid username or password.");
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
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">
              Log in to see your recent chats and pick up where you left off.
            </p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                placeholder="your.username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
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

            {error && <div className="error-text">{error}</div>}

            <div className="form-footer">
              <span>
                New here?{" "}
                <span
                  className="link"
                  onClick={() => navigate("/register")}
                >
                  Create an account
                </span>
              </span>
              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}