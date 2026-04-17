import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ShieldCheck, Circle, Eye, EyeOff, Shield } from "lucide-react";
import api from "../services/api.js";
import "./Auth.css";

export default function RegisterPage() {
  const { isLoggedIn, user, login } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Password
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const [formData, setFormData] = useState({
    name: "",
    identifier: "", // email or phone
    password: "",
  });

  // Password Requirements Validation
  const requirements = [
    { id: 'lowercase', text: 'Must include at least 1 lowercase letter', regex: /[a-z]/ },
    { id: 'uppercase', text: 'Must include at least 1 uppercase letter', regex: /[A-Z]/ },
    { id: 'number', text: 'Must include at least 1 number', regex: /[0-9]/ },
    { id: 'special', text: 'Must include at least 1 special character', regex: /[@$!%*?&]/ },
    { id: 'length', text: 'Must be at least 8 characters long', min: 8 },
  ];

  const validateRequirement = (req) => {
    if (req.min) return formData.password.length >= req.min;
    return req.regex.test(formData.password);
  };

  const isPasswordValid = requirements.every(validateRequirement);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (!user?.isOnboardingComplete) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isLoggedIn, navigate, user]);

  const handleNext = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    if (step === 1) {
      // Step 1 -> 2: Simulate sending OTP
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } else if (step === 2) {
      // Step 2 -> 3: Verify OTP (mock 1234)
      const enteredOtp = otp.join("");
      setTimeout(() => {
        if (enteredOtp === "1234") {
          setStep(3);
        } else {
          alert("Invalid OTP! Try 1234");
        }
        setLoading(false);
      }, 800);
    } else if (step === 3) {
      // Step 3 -> Login: Complete Registration
      setLoading(true);
      try {
        const data = await api.register({
          name: formData.name,
          username: formData.identifier,
          email: formData.identifier.includes("@") ? formData.identifier : `${formData.name.toLowerCase().replace(/\s/g, '')}@trustpay.ai`,
          password: formData.password
        });

        if (data) {
          const backendUser = data.user || data;
          login({ 
            id: backendUser.id || "user_" + Date.now(), 
            name: backendUser.name || backendUser.username || formData.name, 
            email: backendUser.email || formData.identifier,
            username: backendUser.username,
            activePlan: backendUser.activePlan || "none",
            isOnboardingComplete: backendUser.isOnboardingComplete === true,
            role: backendUser.role || "ROLE_WORKER",
          }, data.token || "real_token_" + Date.now());
        }
      } catch (err) {
        console.error("Registration failed:", err);
        alert("Registration failed. This account may already exist.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleBack = () => setStep(step - 1);

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
              Secure Your Financial Future as a Gig Worker
            </h1>
            <div className="login-check-items">
              {["Automated Payouts", "AI Risk Analysis", "No Hidden Fees"].map((item, i) => (
                <div className="check-item" key={i}>
                  <ShieldCheck size={18} />
                  <span>{item}</span>
                </div>
              ))}
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
              {step === 2 ? "OTP Verification" : step === 3 ? "Secure Your Account" : "Join Trustpay Today"}
            </p>
          </div>
          
          <div className="auth-card-body">
            {step === 1 && (
              <>
                <h2 className="auth-main-title">Create your account to get protected</h2>
                <form onSubmit={handleNext}>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="auth-input" 
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="auth-input" 
                      placeholder="Email or Phone Number"
                      value={formData.identifier}
                      onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="auth-primary-btn" disabled={loading || !formData.identifier || !formData.name}>
                    {loading ? "Preparing..." : "Create Account"}
                  </button>
                </form>
                <p className="auth-legal" style={{ marginTop: '24px' }}>
                  Already have an account? <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>Login</Link>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="auth-main-title">Enter the code sent to your {formData.identifier.includes('@') ? 'email' : 'phone'}</h2>
                <div className="auth-edit-hint">
                  <span className="current-id">{formData.identifier}</span>
                  <button onClick={handleBack} className="edit-btn">Change</button>
                </div>
                
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

                <button onClick={handleNext} className="auth-primary-btn" disabled={loading || otp.some(d => !d)}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="resend-box">
                  Didn't receive the code? <button className="resend-link">Resend Code</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="auth-main-title">Create your password</h2>
                <div className="auth-edit-hint">
                  <span className="current-id">{formData.identifier}</span>
                  <button onClick={() => setStep(1)} className="edit-btn">Change</button>
                </div>

                <form onSubmit={handleNext}>
                  <div className="input-group">
                    <div className="auth-input-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="auth-input" 
                        placeholder="Create Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        autoFocus
                      />
                      <button 
                        type="button" 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="password-requirements">
                      {requirements.map((req) => {
                        const isValid = validateRequirement(req);
                        return (
                          <div key={req.id} className={`requirement-item ${isValid ? 'valid' : 'invalid'}`}>
                            {isValid ? <ShieldCheck size={14} /> : <div className="circle-placeholder" />}
                            <span>{req.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-primary-btn" 
                    disabled={loading || !isPasswordValid}
                  >
                    {loading ? "Registering..." : "Create Password"}
                  </button>
                </form>

                <div className="resend-box" style={{ marginTop: '24px' }}>
                  Want to change your signup mode? <button className="resend-link">Use another method</button>
                </div>
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
