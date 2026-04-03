import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { handleOAuthCallback, PARTNER_CONFIG } from "../utils/oauth";
import { useAuthStore }        from "../store/authStore";
import { useUIStore }          from "../store/uiStore";
import { CheckCircle, Settings, XCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate       = useNavigate();
  const { login }      = useAuthStore();
  const { showToast }  = useUIStore();

  const [status,   setStatus]   = useState("processing");
  const [provider, setProvider] = useState(null);
  const [userName, setUserName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Read provider from session before it gets cleared
    const p = sessionStorage.getItem("oauth_provider");
    if (p) setProvider(p);
    processCallback();
  }, [navigate, login, showToast]);

  async function processCallback() {
    try {
      const user = await handleOAuthCallback();

      setUserName(user.name);
      setStatus("success");

      // Store auth
      login(user, user.token);

      // Sync with TrustpayDB if it exists on window
      if (window.TrustpayDB?.currentUser) {
        Object.assign(window.TrustpayDB.currentUser, {
          name:             user.name,
          phone:            user.phone,
          city:             user.city,
          zone:             user.zone,
          platform:         user.platform,
          workerID:         user.workerID,
          vehicleType:      user.vehicleType,
          avgDailyEarnings: user.avgDailyEarnings,
          partnerVerified:  true,
          platformBadge:    user.platformBadge,
        });
      }

      // Toast with partner brand color
      const config = PARTNER_CONFIG[user.provider];
      showToast(
        "success",
        `✅ ${config?.name} account connected! Welcome, ${user.name.split(" ")[0]}.`
      );

      // Navigate after success animation plays
      setTimeout(() => {
        const hasPlan = user.activePlan && user.activePlan !== "none";
        navigate(hasPlan ? "/dashboard" : "/plans", { replace: true });
      }, 1800);

    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Authentication failed. Please try again.");
    }
  }

  const config = provider ? PARTNER_CONFIG[provider] : null;

  // ── PROCESSING STATE ──
  if (status === "processing") {
    return (
      <div className="callback-page">
        <div className="callback-card glass-card"
             style={ config ? { borderColor: config.borderColor } : {} }>

          {/* Partner logo or shield */}
          {config ? (
            <div
              className="callback-partner-logo"
              dangerouslySetInnerHTML={{ __html: config.logo }}
              style={{ transform: "scale(2.5)", marginBottom: "32px", display: 'flex', justifyContent: 'center' }}
            />
          ) : (
            <div className="callback-shield">🛡️</div>
          )}

          {/* Spinner */}
          <div className="callback-spinner">
            <div
              className="spinner-ring"
              style={ config ? { borderTopColor: config.color } : {} }
            />
          </div>

          <h2 className="callback-title">
            {config ? `Connecting ${config.name} account` : "Authenticating..."}
          </h2>
          <p className="callback-subtitle">
            Verifying your partner credentials and loading your profile...
          </p>

          {/* Animated steps */}
          <div className="callback-steps">
            <CallbackStep delay={0}    icon={<CheckCircle size={20} color="var(--accent-cyan)" />} text="Identity verified" />
            <CallbackStep delay={500}  icon={<CheckCircle size={20} color="var(--accent-cyan)" />} text="Partner profile loaded" />
            <CallbackStep delay={1000} icon={<Settings size={20} color="var(--text-secondary)" className="animate-spin" />} text="Setting up Trustpay..." />
          </div>

        </div>
      </div>
    );
  }

  // ── SUCCESS STATE ──
  if (status === "success") {
    return (
      <div className="callback-page">
        <div className="callback-card glass-card"
             style={ config ? { borderColor: config.color + "66" } : {} }>

          {/* Partner logo */}
          {config && (
            <div
              style={{ transform: "scale(2.5)", marginBottom: "24px", display: 'flex', justifyContent: 'center' }}
              dangerouslySetInnerHTML={{ __html: config.logo }}
            />
          )}

          {/* Success check */}
          <div className="callback-success-check" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
             <CheckCircle size={48} color="var(--accent-cyan)" />
          </div>

          <h2 className="callback-title">
            {config?.name} Account Connected!
          </h2>
          <p className="callback-subtitle">
            Welcome, {userName}! Setting up your dashboard...
          </p>

          {/* Progress bar */}
          <div className="callback-progress-track">
            <div
              className="callback-progress-fill"
              style={ config ? { background: config.color } : {} }
            />
          </div>

          <p className="callback-redirect-note">
            Redirecting to Trustpay...
          </p>

        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  return (
    <div className="callback-page">
      <div className="callback-card glass-card"
           style={{ borderColor: "var(--accent-red)" }}>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", color: "var(--accent-red)" }}>
          <XCircle size={48} />
        </div>
        <h2 className="callback-title" style={{ color: "var(--accent-red)" }}>
          Connection Failed
        </h2>
        <p className="callback-subtitle">{errorMsg}</p>

        <button
          className="btn-cyan"
          style={{ marginTop: "24px", width: "100%", padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--accent-cyan)', color: 'black', fontWeight: 700, cursor: 'pointer' }}
          onClick={() => navigate("/login", { replace: true })}
        >
          ← Try Again
        </button>

      </div>
    </div>
  );
}

// Animated step item
function CallbackStep({ delay, icon, text }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="callback-step" style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? "translateY(0)" : "translateY(8px)",
      transition: "all 0.4s ease",
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    }}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
