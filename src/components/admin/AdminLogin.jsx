import { useState } from "react";
import { motion } from "framer-motion";
import { apiEndpoint } from "../../config.js";

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(apiEndpoint("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <motion.div
        className="admin-auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Admin Login</h2>
        <p className="muted">Sign in to manage your portfolio content.</p>

        {error && <div className="form-status error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="mucyo answer"
            required
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <div className="password-wrapper" style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoComplete="current-password"
              style={{ width: "100%", paddingRight: "50px" }}
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "6px", top: "6px", width: "36px", height: "36px", border: "none" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Signing in..." : "Login to Dashboard"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <a href="#top" className="link" onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}>
            ← Back to Public Portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
