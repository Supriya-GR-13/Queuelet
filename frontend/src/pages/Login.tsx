import { useState } from "react";

interface LoginProps {
  onLogin: (name: string, email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

function Login({ onLogin, loading, error }: LoginProps) {
  const [name, setName] = useState("Supriya");
  const [email, setEmail] = useState("demo@queuelet.dev");

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand-large">
          <div className="logo">Q</div>
          <span>Queuelet</span>
        </div>

        <div className="login-content">
          <h1>
            Schedule smarter.
            <br />
            <span>Reach further.</span>
          </h1>

          <p>
            Automate your email outreach with Queuelet. Create
            campaigns, schedule emails and track everything from one
            simple dashboard.
          </p>

          <div className="feature-row">
            <div>✓ Smart scheduling</div>
            <div>✓ Campaign tracking</div>
            <div>✓ Email automation</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="mobile-logo">
            <div className="logo">Q</div>
            <span>Queuelet</span>
          </div>

          <h2>Welcome to Queuelet</h2>
          <p className="login-subtitle">
            Sign in to manage your email campaigns
          </p>

          <label style={{ display: "block", textAlign: "left", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Name
          </label>
          <input
            style={{ width: "100%", border: "1px solid #dce1ea", borderRadius: 8, padding: "10px 12px", marginBottom: 14, fontSize: 13 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />

          <label style={{ display: "block", textAlign: "left", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Email
          </label>
          <input
            style={{ width: "100%", border: "1px solid #dce1ea", borderRadius: 8, padding: "10px 12px", marginBottom: 20, fontSize: 13 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
          />

          <button
            className="demo-button"
            disabled={loading || !email}
            onClick={() => onLogin(name, email)}
          >
            {loading ? "Signing in..." : "Continue as Demo User"}
          </button>

          {error && (
            <p style={{ color: "#d64545", fontSize: 13, marginTop: 14 }}>
              {error}
            </p>
          )}

          <p className="terms">
            This creates (or reuses) a real user record in the Queuelet
            database — no password required for this demo build. By
            continuing, you agree to Queuelet's Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
