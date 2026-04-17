import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, updatePassword } from "../store/authStore";
import { ShieldCheck, Circle, AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import api from "../services/api.js";
import "./Auth.css";

export default function AuthPage() {
  const { isLoggedIn, user, hasPlan, login } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: ID, 2: Pass, 10: ForgotID, 11: ForgotOTP, 12: ForgotNewPass
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    newPassword: ""
  });

  // Password Requirements
  const requirements = [
    { id: 'lowercase', text: 'Must include at least 1 lowercase letter', regex: /[a-z]/ },
    { id: 'uppercase', text: 'Must include at least 1 uppercase letter', regex: /[A-Z]/ },
    { id: 'number', text: 'Must include at least 1 number', regex: /[0-9]/ },
    { id: 'special', text: 'Must include at least 1 special character', regex: /[@$!%*?&]/ },
    { id: 'length', text: 'Must be at least 8 characters long', min: 8 },
  ];

  const validateReq = (req, val) => {
    if (req.min) return val.length >= req.min;
    return req.regex.test(val);
  };

  const isNewPassValid = requirements.every(r => validateReq(r, formData.newPassword));

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (!user?.isOnboardingComplete) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate(hasPlan() ? "/dashboard" : "/plans", { replace: true });
      }
    }
  }, [isLoggedIn, navigate, hasPlan, user]);

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    if (step === 1) {
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 400);
    } 
    else if (step === 2) {
      try {
        const data = await api.login({
          identifier: formData.identifier,
          email: formData.identifier,
          password: formData.password
        });

        if (data) {
          const backendUser = data.user || data;
          login({ 
            id: backendUser.id || "user_1", 
            name: backendUser.name || backendUser.username || "User", 
            email: backendUser.email || formData.identifier,
            username: backendUser.username,
            activePlan: backendUser.activePlan || "none",
            isOnboardingComplete: backendUser.isOnboardingComplete === true,
            role: backendUser.role || "ROLE_WORKER",
          }, data.token || "real_token");
        }
      } catch (err) {
        console.error("Login API error:", err);
        setError("Network error. Could not connect to API.");
      } finally {
        setLoading(false);
      }
    }
    else if (step === 10) {
      setTimeout(() => {
        setStep(11);
        setLoading(false);
      }, 600);
    }
    else if (step === 11) {
      const enteredOtp = otp.join("");
      setTimeout(() => {
        if (enteredOtp === "1234") {
          setStep(12);
        } else {
          setError("Invalid OTP! Use 1234");
        }
        setLoading(false);
      }, 800);
    }
    else if (step === 12) {
      setTimeout(() => {
        if (updatePassword(formData.identifier, formData.newPassword)) {
          setStep(2);
          alert("Password updated successfully!");
        }
        setLoading(false);
      }, 1000);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 3) otpRefs[index + 1].current.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs[index - 1].current.focus();
  };

  const resetFlow = () => {
    setStep(1);
    setError("");
    setFormData({ identifier: "", password: "", newPassword: "" });
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand-top">
             <img src="/favicon.svg" alt="Trustpay Logo" className="brand-logo-img" />
             <span className="brand-name-white">Trustpay<span className="cyan-dot">.</span></span>
          </div>

          <div className="login-bottom-content">
            <h1 className="login-main-heading">
              Powering Instant Insurance Payouts for the Gig Economy
            </h1>
            
            <div className="login-check-items">
              <div className="check-item">
                <ShieldCheck size={18} />
                <span>Instant Claim Settlements</span>
              </div>
              <div className="check-item">
                <ShieldCheck size={18} />
                <span>Secure & Transparent System</span>
              </div>
              <div className="check-item">
                <ShieldCheck size={18} />
                <span>Real-Time Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="auth-card">
          <div className="auth-card-top">
            <div className="auth-logo-box">
              <img src="/favicon.svg" alt="Trustpay Logo" />
            </div>
            <p className="auth-welcome-text">
              {step >= 10 ? "Reset Password" : "Welcome back to Trustpay"}
            </p>
          </div>
          
          <div className="auth-card-body">
            {step === 1 && (
              <>
                <h2 className="auth-main-title">Login with your identifier</h2>
                <form onSubmit={handleAuth}>
                  <div className="input-group">
                    <input 
                      type="text" className="auth-input" placeholder="Email or Phone Number"
                      value={formData.identifier}
                      onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                      required
                    />
                  </div>
                  {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}
                  <button type="submit" className="auth-primary-btn" disabled={loading || !formData.identifier}>
                    {loading ? "Checking..." : "Continue"}
                  </button>
                </form>
                <p className="auth-legal" style={{ marginTop: '24px' }}>
                  New to Trustpay? <Link to="/register" style={{ color: '#2563EB', fontWeight: 600 }}>Register Now</Link>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="auth-main-title">Enter your password</h2>
                <div className="auth-edit-hint">
                  <span className="current-id">{formData.identifier}</span>
                  <button onClick={resetFlow} className="edit-btn">Change</button>
                </div>
                <form onSubmit={handleAuth}>
                  <div className="input-group">
                    <div className="auth-input-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"} className="auth-input" placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        autoFocus
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}
                  <button type="submit" className="auth-primary-btn" disabled={loading || !formData.password}>
                    {loading ? "Verifying..." : "Login"}
                  </button>
                </form>
                <div className="resend-box" style={{ marginTop: '24px' }}>
                  <button onClick={() => setStep(10)} className="resend-link">Forgot Password?</button>
                </div>
              </>
            )}

            {step === 10 && (
              <>
                <h2 className="auth-main-title">Forgot your password?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Enter your email or phone number and we'll send you an OTP to reset it.</p>
                <form onSubmit={handleAuth}>
                  <div className="input-group">
                    <input 
                      type="text" className="auth-input" placeholder="Email or Phone Number"
                      value={formData.identifier}
                      onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="auth-primary-btn" disabled={loading || !formData.identifier}>
                    {loading ? "Sending OTP..." : "Continue"}
                  </button>
                </form>
                <div className="resend-box" style={{ marginTop: '24px' }}>
                  <button onClick={() => setStep(2)} className="resend-link">Back to Login</button>
                </div>
              </>
            )}

            {step === 11 && (
              <>
                <h2 className="auth-main-title">Enter Verification Code</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>We've sent a code to {formData.identifier}</p>
                <div className="otp-input-container">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      className="otp-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      maxLength={1}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '16px 0' }}>{error}</p>}
                <button onClick={handleAuth} className="auth-primary-btn" disabled={loading || otp.some(d => !d)}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
                <div className="resend-box" style={{ marginTop: '24px' }}>
                  Didn't receive the code? <button className="resend-link">Resend Code</button>
                </div>
              </>
            )}

            {step === 12 && (
              <>
                <h2 className="auth-main-title">Create new password</h2>
                <form onSubmit={handleAuth}>
                  <div className="input-group">
                    <div className="auth-input-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"} className="auth-input" placeholder="New Password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        required
                        autoFocus
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="password-requirements">
                    {requirements.map((req) => {
                      const isValid = validateReq(req, formData.newPassword);
                      return (
                        <div key={req.id} className={`requirement-item ${isValid ? 'valid' : 'invalid'}`}>
                          {isValid ? <ShieldCheck size={14} /> : <Circle size={14} />}
                          <span>{req.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button type="submit" className="auth-primary-btn" disabled={loading || !isNewPassValid}>
                    {loading ? "Updating..." : "Reset Password"}
                  </button>
                </form>
              </>
            )}

            <p className="auth-legal" style={{ marginTop: '32px' }}>
              By continuing, you agree to our <a href="#">privacy policy</a> and <a href="#">terms of use</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}