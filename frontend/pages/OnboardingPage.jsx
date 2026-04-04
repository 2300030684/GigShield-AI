import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, Shield, ShieldCheck, Activity, AlertCircle, ArrowUpRight } from 'lucide-react';
import './Onboarding.css';

export default function OnboardingPage() {
  const { user, logout, completeOnboarding } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1, 2, 3.1, 3.2, 3.4, 3.5, 3.6, 3.7 (REVIEW)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    platforms: [], 
    panNumber: '',
    panName: '', 
    phone: '',
    payoutMethod: '', // 'bank' or 'upi'
    bankDetails: { account: '', ifsc: '' },
    upiId: '',
    isUpiVerified: false
  });

  const steps = [
    { id: 1, label: 'Basic details', icon: <User size={18} /> },
    { id: 2, label: 'Work details', icon: <Shield size={18} /> },
    { id: 3, label: 'KYC details', icon: <ShieldCheck size={18} /> }
  ];

  const currentMainStep = Math.floor(step);

  const handleContinue = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        alert('Please enter your full name to continue.');
        return;
      }
      setStep(2);
    }
    else if (step === 2) {
      if (formData.platforms.length === 0) {
        alert('Please select at least one work platform.');
        return;
      }
      setStep(3.1);
    }
    else if (step === 3.1) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
        alert('Please enter a valid PAN number (e.g. ABCDE1234F)');
        return;
      }
      setFormData(prev => ({ ...prev, panName: prev.fullName.toUpperCase() }));
      setStep(3.2);
    }
    else if (step === 3.2) setStep(3.4);
    else if (step === 3.4) {
      if (!formData.phone || formData.phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }
      setStep(3.5);
    }
    else if (step === 3.5) {
      if (!formData.payoutMethod) {
        alert('Please select a payout method.');
        return;
      }
      setStep(3.6);
    }
    else if (step === 3.6) {
      if (formData.payoutMethod === 'bank') {
        if (!formData.bankDetails.account || !formData.bankDetails.ifsc) {
          alert('Please enter your account number and IFSC code.');
          return;
        }
      } else if (formData.payoutMethod === 'upi') {
        if (!formData.upiId) {
          alert('Please enter your UPI ID.');
          return;
        }
        if (!formData.isUpiVerified) {
          alert('Please verify your UPI ID before continuing.');
          return;
        }
      }
      setStep(3.7);
    }
    else if (step === 3.7) {
      setIsSubmitting(true);
      // Create a submission payload with all the collected data
      const submissionData = {
        name: formData.fullName,
        platform: formData.platforms[0] || 'Swiggy',
        panNumber: formData.panNumber,
        phone: formData.phone,
        isOnboardingComplete: true,
        upiID: formData.payoutMethod === 'upi' ? formData.upiId : '',
      };

      import('../services/api.js').then(async (m) => {
        const api = m.default;
        try {
          await api.updateProfile(submissionData);
          // Persist onboarding data to localStorage so dashboard can read it
          const savedUser = JSON.parse(localStorage.getItem('tp_user') || '{}');
          const updatedUser = {
            ...savedUser,
            ...submissionData,
            platforms: formData.platforms,
            payoutMethod: formData.payoutMethod,
            bankDetails: formData.payoutMethod === 'bank' ? formData.bankDetails : savedUser.bankDetails,
            isOnboardingComplete: true,
            plan: savedUser.plan || 'standard',
            city: savedUser.city || 'Hyderabad',
            zone: savedUser.zone || 'Kondapur',
            vehicleType: savedUser.vehicleType || '2-Wheeler',
            protectionScore: savedUser.protectionScore || 76,
          };
          localStorage.setItem('tp_user', JSON.stringify(updatedUser));
          completeOnboarding();
          navigate('/dashboard');
        } catch (err) {
          console.error("Failed to save onboarding data:", err);
          alert("We couldn't save your details. Please try again.");
          setIsSubmitting(false);
        }
      });
    }
  };

  const handleBackStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3.1) setStep(2);
    else if (step === 3.2) setStep(3.1);
    else if (step === 3.4) setStep(3.2);
    else if (step === 3.5) setStep(3.4);
    else if (step === 3.6) setStep(3.5);
    else if (step === 3.7) setStep(3.6);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="onboarding-container">
      {/* ── SIDEBAR ── */}
      <aside className="onboarding-sidebar">
        <div className="sidebar-top">
          <div className="user-profile-card">
            <div className="avatar-circle">
              {formData.fullName.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{formData.fullName || 'User'}</span>
              <button className="logout-inline-btn" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          <div className="onboarding-heading">
            Onboarding: <br />
            <strong style={{ color: '#2563EB' }}>Trustpay</strong>
          </div>

          <nav className="onboarding-steps">
            <div className="steps-line"></div>
            {steps.map((s) => (
              <div 
                key={s.id} 
                className={`step-item ${currentMainStep === s.id ? 'active' : currentMainStep > s.id ? 'completed' : ''}`}
                style={{ cursor: currentMainStep > s.id ? 'pointer' : 'default' }}
                onClick={() => currentMainStep > s.id && setStep(s.id)}
              >
                <div className="step-number-box">
                  {currentMainStep > s.id ? <ShieldCheck size={16} /> : s.id}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            ))}
          </nav>
        </div>

      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="onboarding-main">
        <div className="onboarding-card">
          <div className="card-breadcrumb">
             <div className="razorpay-logo-ref">
               <img src="/favicon.svg" alt="Trustpay" style={{ width: '16px', height: '16px' }} />
               <span style={{ color: '#2563EB', fontWeight: 800 }}>Trustpay</span>
             </div>
          </div>

          <div className="card-content">
            {step === 1 && (
              <div className="onboarding-step-content fade-in">
                <h1 className="onboarding-step-title">Add your Name</h1>
                <p className="onboarding-step-desc">
                  Let us know the name of the person who'll be completing the onboarding
                </p>
                <div className="onboarding-input-group">
                  <label>Full name</label>
                  <input 
                    type="text" 
                    className="onboarding-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="e.g. Burri Vishnu Sai"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="onboarding-step-content fade-in" style={{ maxWidth: '600px' }}>
                <h1 className="onboarding-step-title">Where do you work?</h1>
                <p className="onboarding-step-desc">
                  Select the platform you currently deliver or work for
                </p>
                <div className="platform-grid">
                  {[
                    { name: 'Swiggy', logo: '/platforms/swiggy.png' },
                    { name: 'Zomato', logo: '/platforms/zomato.png' },
                    { name: 'Zepto', logo: '/platforms/zepto.png' },
                    { name: 'Blinkit', logo: '/platforms/blinkit.png' },
                    { name: 'Dunzo', logo: '/platforms/dunzo.png' },
                    { name: 'Others', logo: '/platforms/others.png' }
                  ].map(platform => (
                    <div 
                      key={platform.name} 
                      className={`platform-card ${formData.platforms.includes(platform.name) ? 'selected' : ''}`}
                      onClick={() => {
                        const newPlatforms = formData.platforms.includes(platform.name)
                          ? formData.platforms.filter(p => p !== platform.name)
                          : [...formData.platforms, platform.name];
                        setFormData({...formData, platforms: newPlatforms});
                      }}
                    >
                      <div className="platform-logo-container">
                        <img src={platform.logo} alt={platform.name} className="platform-logo-img" />
                      </div>
                      <span className="platform-name">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3.1 && (
              <div className="onboarding-step-content fade-in">
                <h1 className="onboarding-step-title">Add your PAN details</h1>
                <p className="onboarding-step-desc">
                  We require this to verify your identity
                </p>
                <div className="onboarding-input-group">
                  <label>PAN Number</label>
                  <input 
                    type="text" 
                    className="onboarding-input"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({...formData, panNumber: e.target.value.toUpperCase()})}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 3.2 && (
              <div className="onboarding-step-content fade-in">
                <h1 className="onboarding-step-title">Review your PAN details</h1>
                <div className="pan-review-card">
                  <div className="pan-header">
                    <div className="pan-gov-header">
                      <span className="pan-gov-title">Income Tax Department</span>
                      <span className="pan-gov-subtitle">Government of India</span>
                    </div>
                    <div className="pan-chip"></div>
                  </div>
                  <div className="pan-body">
                    <div className="pan-row">
                      <span className="pan-label">NAME AS PER PAN</span>
                      <span className="pan-value">{formData.panName}</span>
                    </div>
                    <div className="pan-row">
                      <span className="pan-label">PAN NUMBER</span>
                      <span className="pan-value">{formData.panNumber}</span>
                    </div>
                  </div>
                  <div className="pan-verified-badge">
                    <ShieldCheck size={14} /> VERIFIED BY TRUSTPAY AI
                  </div>
                </div>
                <p style={{ marginTop: '24px', fontSize: '13px', color: '#697386' }}>
                  If these details are incorrect, please go back and edit your PAN.
                </p>
              </div>
            )}

            {step === 3.7 && (
              <div className="onboarding-step-content fade-in" style={{ maxWidth: '600px' }}>
                <h1 className="onboarding-step-title">Review your details</h1>
                <p className="onboarding-step-desc">
                  Final verification of your account information
                </p>
                <div className="review-summary">
                  <div className="review-item">
                    <div className="review-label">Name</div>
                    <div className="review-value-box">
                      <span>{formData.fullName}</span>
                      <button className="edit-btn" onClick={() => setStep(1)}><Activity size={14} /></button>
                    </div>
                  </div>
                  <div className="review-item">
                    <div className="review-label">Work Platforms</div>
                    <div className="review-value-box">
                      <span>{formData.platforms.join(', ')}</span>
                      <button className="edit-btn" onClick={() => setStep(2)}><Activity size={14} /></button>
                    </div>
                  </div>
                  <div className="review-item">
                    <div className="review-label">PAN</div>
                    <div className="review-value-box">
                      <span>{formData.panNumber}</span>
                      <button className="edit-btn" onClick={() => setStep(3.1)}><Activity size={14} /></button>
                    </div>
                  </div>
                  <div className="review-item">
                    <div className="review-label">Payout Method</div>
                    <div className="review-value-box">
                      <span>
                        {formData.payoutMethod === 'upi'
                          ? `UPI: ${formData.upiId || 'Not entered'}`
                          : formData.payoutMethod === 'bank'
                            ? `Bank: ****${(formData.bankDetails.account || '').slice(-4) || 'XXXX'}`
                            : 'Not selected'}
                      </span>
                      <button className="edit-btn" onClick={() => setStep(3.5)}><Activity size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3.4 && (
              <div className="onboarding-step-content fade-in">
                <h1 className="onboarding-step-title">Auto-fill KYC details</h1>
                <p className="onboarding-step-desc">
                  Enter mobile linked with your PAN
                </p>
                <div className="onboarding-input-group">
                  <label>Linked Mobile Number</label>
                  <div className="phone-input-wrapper">
                    <span className="prefix">+91</span>
                    <input 
                      type="text" 
                      className="onboarding-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="9876543210"
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3.5 && (
              <div className="onboarding-step-content fade-in" style={{ maxWidth: '600px' }}>
                <h1 className="onboarding-step-title">How would you like to receive payouts?</h1>
                <p className="onboarding-step-desc">
                  Choose your preferred withdrawal method
                </p>
                <div className="payout-selection">
                  <div 
                    className={`payout-card ${formData.payoutMethod === 'bank' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, payoutMethod: 'bank'})}
                  >
                    <div className="payout-icon">🏦</div>
                    <div className="payout-info">
                      <span className="payout-title">Bank Account</span>
                      <span className="payout-subtitle">Direct transfer to your account</span>
                    </div>
                  </div>
                  <div 
                    className={`payout-card ${formData.payoutMethod === 'upi' ? 'selected' : ''}`}
                    onClick={() => setFormData({...formData, payoutMethod: 'upi'})}
                  >
                    <div className="payout-icon">📱</div>
                    <div className="payout-info">
                      <span className="payout-title">UPI ID</span>
                      <span className="payout-subtitle">Instant settlement via VPA</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3.6 && (
              <div className="onboarding-step-content fade-in">
                {formData.payoutMethod === 'bank' ? (
                  <>
                    <h1 className="onboarding-step-title">Enter Bank Details</h1>
                    <div className="onboarding-input-group">
                      <label>ACCOUNT NUMBER</label>
                      <input 
                        type="password" 
                        className="onboarding-input"
                        placeholder="000000000000"
                        onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, account: e.target.value}})}
                      />
                    </div>
                    <div className="onboarding-input-group">
                      <label>IFSC CODE</label>
                      <input 
                        type="text" 
                        className="onboarding-input"
                        placeholder="HDFC0001234"
                        onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, ifsc: e.target.value.toUpperCase()}})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="onboarding-step-title">Enter UPI ID</h1>
                    <div className="onboarding-input-group">
                      <label>UPI ID</label>
                      <div className="upi-input-wrapper">
                        <input 
                          type="text" 
                          className="onboarding-input"
                          placeholder="name@upi"
                          value={formData.upiId}
                          onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                        />
                        <button className="verify-btn" onClick={() => setFormData({...formData, isUpiVerified: true})}>
                          {formData.isUpiVerified ? "VERIFIED ✅" : "VERIFY"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}


          </div>

          <div className="onboarding-footer">
            {step > 1 && step < 4 && (
              <button className="onboarding-back-btn" onClick={handleBackStep}>
                BACK
              </button>
            )}
            <button 
              className="onboarding-continue-btn" 
              onClick={handleContinue}
              style={{ width: step === 3.7 ? '100%' : 'auto', maxWidth: step === 3.7 ? 'none' : '180px' }}
            >
              {step === 3.7 ? "GO TO DASHBOARD" : "CONTINUE"}
            </button>
          </div>
        </div>
      </main>

      {isSubmitting && (
        <div className="onboarding-loading-overlay">
          <div className="loading-content">
            <div className="spinner-wrapper">
              <div className="loading-spinner-ring"></div>
              <img src="/favicon.svg" alt="Loading" className="loading-favicon-spinning" />
            </div>
            <p>Setting up your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
