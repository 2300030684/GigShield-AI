import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CheckCircle, MapPin, Activity, CloudRain, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api.js';
import { connectSocket } from '../services/socket.js';

// ─────────────────────────────────────────────────────
//  CLAIM FLOW — live GPS + weather + AI + Razorpay payout
// ─────────────────────────────────────────────────────
const ClaimFlow = () => {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [claimID, setClaimID] = useState(null);
  const [error, setError] = useState('');
  const [processingSteps, setProcessingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [payout, setPayout] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Track processing steps animation
  useEffect(() => {
    if (step === 2 && processingSteps.length > 0 && currentStep < processingSteps.length) {
      const delay = processingSteps[currentStep]?.delay || 500;
      const timer = setTimeout(() => setCurrentStep(p => p + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [step, processingSteps, currentStep]);

  // Socket.io: listen for real-time claim events
  useEffect(() => {
    let socket;
    try {
      socket = connectSocket();
      socket.on('claim:processing', (data) => {
        console.log('[Socket] claim:processing', data);
      });
      socket.on('claim:approved', (data) => {
        console.log('[Socket] claim:approved', data);
      });
    } catch (err) {
      console.warn('[Socket] Could not connect (backend may be offline)');
    }
    return () => {
      try { socket?.off('claim:processing'); socket?.off('claim:approved'); } catch (_) {}
    };
  }, []);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ── STEP 1: GET GPS LOCATION + LIVE WEATHER ──
  const handleGetLocation = () => {
    setGpsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation not supported. Using default location.');
      handleManualLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        try {
          // Verify + geocode
          const locRes = await api.verifyLocation(lat, lng, accuracy);
          const weatherRes = await api.getWeather(lat, lng);
          setLocation({ ...locRes, lat, lng, accuracy });
          setWeather(weatherRes.weather);
          setSelectedEvent(weatherRes.weather?.event);
        } catch (err) {
          setError('Location verified (API error: ' + err.message + '). Using GPS only.');
          setLocation({ zone: 'Kondapur', city: 'Hyderabad', lat, lng, accuracy, isCovered: true });
        }
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setError('GPS unavailable. Using your registered zone.');
        handleManualLocation();
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualLocation = async () => {
    setGpsLoading(true);
    try {
      // Advanced Fallback: IP-based real-time city lookup
      let ipCity = null; let ipLat = null; let ipLng = null;
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData && ipData.city) {
          ipCity = ipData.city;
          ipLat = ipData.latitude;
          ipLng = ipData.longitude;
        }
      } catch (e) { console.warn('IP fallback failed', e); }

      const meRes = await api.getMe();
      const user = meRes.user;
      const lat = ipLat || user.coordinates?.lat || 17.4726;
      const lng = ipLng || user.coordinates?.lng || 78.3572;
      const finalCity = ipCity || user.city || 'Hyderabad';
      const finalZone = ipCity || user.zone || 'Kondapur';

      const weatherRes = await api.getWeather(lat, lng);
      setLocation({ zone: finalZone, city: finalCity, lat, lng, accuracy: 5000, isCovered: true, method: 'ip-fallback' });
      setWeather(weatherRes.weather);
      setSelectedEvent(weatherRes.weather?.event);
    } catch (err) {
      setLocation({ zone: 'Kondapur', city: 'Hyderabad', lat: 17.4726, lng: 78.3572, accuracy: 999, isCovered: true, method: 'manual' });
      setWeather({ event: 'Heavy Rain', intensity: '38mm/hr', temperature: 29 });
      setSelectedEvent('Heavy Rain');
    }
    setGpsLoading(false);
  };

  // ── STEP 2: AI ANALYZE ──
  const handleAnalyze = async () => {
    if (!selectedEvent) { setError('Please select a weather event'); return; }
    setAnalyzing(true);
    setError('');
    setProcessingSteps([]);
    setCurrentStep(0);

    try {
      const result = await api.initiateClaim({
        lat: location?.lat,
        lng: location?.lng,
        accuracy: location?.accuracy || 30,
        locationMethod: location?.method || 'gps',
      });

      if (result.success) {
        setClaimID(result.claimID);
        setAiResult(result.aiResult);
        setProcessingSteps(result.aiResult?.processingSteps || []);
        setTimeout(() => {
          setAnalyzing(false);
          setStep(2);
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'AI analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  // ── STEP 3: CONFIRM PAYOUT ──
  const handleConfirm = async () => {
    setConfirming(true);
    setError('');
    try {
      // 1. Create a "Verification" Order for ₹1
      const orderRes = await api.createPaymentOrder({ 
        amount: 1, 
        currency: 'INR',
        receipt: `claim_verify_${claimID}`
      });

      if (!orderRes.id) throw new Error('Could not create payment order');

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_SeYJrzvheRHhMc',
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'TrustPay Integration',
        description: 'Instant Claim Verification Fee',
        order_id: orderRes.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const verifyRes = await api.verifyPaymentSignature(response);
            if (verifyRes.success) {
              // 4. Finalize Claim
              const result = await api.confirmClaim(claimID);
              if (result.success) {
                setPayout({
                  ...result,
                  txnID: response.razorpay_payment_id // Use real Razorpay Payment ID
                });
                setStep(3);
              }
            } else {
              setError('Payment verification failed.');
            }
          } catch (err) {
            setError('Error finalizing claim: ' + err.message);
          } finally {
            setConfirming(false);
          }
        },
        prefill: {
          name: 'TrustPay User',
          email: 'user@trustpay.ai',
          contact: '9999999999'
        },
        theme: {
          color: '#00E0FF'
        },
        modal: {
          ondismiss: () => setConfirming(false)
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setError(err.message || 'Verification flow failed. Please try again.');
      setConfirming(false);
    }
  };

  const weatherEvents = [
    { id: 'Heavy Rain', icon: '🌧', label: 'Heavy Rain' },
    { id: 'Storm', icon: '⛈', label: 'Storm' },
    { id: 'Heatwave', icon: '☀️', label: 'Heatwave' },
    { id: 'Road Block', icon: '🚧', label: 'Road Block' },
    { id: 'Moderate Rain', icon: '🌦', label: 'Moderate Rain' },
    { id: 'Flood', icon: '🌊', label: 'Flood' },
  ];

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🛡 File A Claim</h1>
        <p style={{ color: 'var(--text-secondary)' }}>AI-verified instant payouts — zero paperwork</p>
      </header>

      {/* Progress steps */}
      <div style={{ display: 'flex', marginBottom: '48px', gap: '8px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= s ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
              color: step >= s ? '#000' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '14px', flexShrink: 0,
              transition: 'all 0.3s ease',
            }}>
              {step > s ? '✓' : s}
            </div>
            <div style={{ flex: 1, height: 2, background: step > s ? 'var(--accent-cyan)' : 'var(--bg-secondary)', transition: 'all 0.3s ease' }} />
          </div>
        ))}
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: step === 3 ? 'var(--accent-green)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
          {step === 3 ? '✓' : '💳'}
        </div>
      </div>

      {/* ── STEP 1: LOCATION + EVENT SELECTION ── */}
      {step === 1 && (
        <Card glow>
          <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Verify Location & Disruption</h3>

          {/* GPS Card */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: location ? '1px solid var(--accent-green)' : '1px solid var(--border)' }}>
            {!location ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <MapPin color="var(--accent-cyan)" />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Location Verification</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                  We need your GPS location to verify coverage zone and fetch real-time weather data.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="primary" glow onClick={handleGetLocation} disabled={gpsLoading} style={{ flex: 1 }}>
                    {gpsLoading ? <><Loader2 size={16} className="animate-spin" /> Fetching GPS...</> : '📍 Allow GPS'}
                  </Button>
                  <Button variant="outline" onClick={handleManualLocation} disabled={gpsLoading}>
                    Use Profile Zone
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CheckCircle color="var(--accent-green)" size={24} />
                <div>
                  <div style={{ fontWeight: 600 }}>📍 {location.zone}, {location.city}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Accuracy: ±{Math.round(location.accuracy || 30)}m · {location.isCovered ? '✅ Covered zone' : '⚠️ Zone may not be covered'}
                  </div>
                </div>
                <Badge variant="green" style={{ marginLeft: 'auto' }}>VERIFIED</Badge>
              </div>
            )}
          </div>

          {/* Live weather */}
          {weather && (
            <div style={{ background: 'rgba(0, 224, 255, 0.05)', border: '1px solid var(--accent-cyan)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>LIVE WEATHER — OpenWeatherMap</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>
                  {weather.event === 'Heavy Rain' || weather.event === 'Flood' ? '🌧' : weather.event === 'Storm' ? '⛈' : weather.event === 'Heatwave' ? '☀️' : '🌡'}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '18px' }}>{weather.event}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{weather.intensity} · {weather.temperature}°C · {weather.humidity}% humidity</div>
                </div>
              </div>
            </div>
          )}

          {/* Event selector */}
          {location && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  Confirm Disruption Event
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {weatherEvents.map(evt => (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt.id)}
                      style={{
                        padding: '16px 12px',
                        borderRadius: '12px',
                        border: selectedEvent === evt.id ? '2px solid var(--accent-cyan)' : '1px solid var(--border)',
                        background: selectedEvent === evt.id ? 'rgba(0, 224, 255, 0.1)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{evt.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{evt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px', padding: '12px', background: 'rgba(255,77,106,0.1)', borderRadius: '8px' }}>{error}</div>}

              <Button
                variant="primary"
                glow
                style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                onClick={handleAnalyze}
                disabled={!selectedEvent || analyzing}
              >
                {analyzing ? <><Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />AI Analyzing...</> : '🤖 Analyze with AI →'}
              </Button>
            </>
          )}
        </Card>
      )}

      {/* ── STEP 2: AI ANALYSIS RESULT ── */}
      {step === 2 && aiResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card glow>
            <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>🧠 AI Processing Complete</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {(processingSteps.length > 0 ? processingSteps : aiResult.processingSteps || []).map((s, idx) => (
                <div key={idx} style={{
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                  opacity: idx < currentStep ? 1 : 0.3,
                  transition: 'opacity 0.5s ease',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: idx < currentStep ? (s.status === 'success' ? 'rgba(0,255,156,0.15)' : 'rgba(255,140,66,0.15)') : 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>
                    {idx < currentStep ? (s.status === 'success' ? '✅' : '⚠️') : s.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{s.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.detail}</div>
                    {s.subDetail && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.subDetail}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Payout result */}
            {aiResult.approved ? (
              <div style={{ background: 'rgba(0, 255, 156, 0.05)', border: '1px solid var(--accent-green)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>APPROVED PAYOUT</div>
                <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '8px' }}>
                  ₹{aiResult.finalPayout || aiResult.approvedPayout}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Fraud Score: {aiResult.fraudScore}/100 · Confidence: {aiResult.confidence}% · {aiResult.planName} Plan
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255, 77, 106, 0.05)', border: '1px solid var(--accent-red)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '8px' }}>Claim Not Approved</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{aiResult.rejectionReason || 'This claim does not meet our coverage criteria.'}</div>
              </div>
            )}

            {aiResult.breakdown && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {[
                  ['Expected Earnings', `₹${aiResult.breakdown.expectedHourlyEarnings}`],
                  ['Actual Earnings', `₹${aiResult.breakdown.actualHourlyEarnings}`],
                  ['Income Loss', `₹${aiResult.breakdown.rawIncomeLoss}`],
                  ['Coverage Applied', `${aiResult.breakdown.coverageRate}%`],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}

            {error && <div style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

            {aiResult.approved && (
              <Button variant="primary" glow style={{ width: '100%', padding: '16px', fontSize: '16px' }} onClick={handleConfirm} disabled={confirming}>
                {confirming ? <><Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />Processing Payout...</> : `💳 Confirm ₹${aiResult.finalPayout || aiResult.approvedPayout} Payout →`}
              </Button>
            )}
            {!aiResult.approved && (
              <Button variant="outline" style={{ width: '100%' }} onClick={() => setStep(1)}>← Try Again</Button>
            )}
          </Card>
        </div>
      )}

      {/* ── STEP 3: PAYOUT SUCCESS ── */}
      {step === 3 && payout && (
        <Card glow style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🎉</div>
          <div style={{ fontSize: '20px', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '8px' }}>
            Payout Successful!
          </div>
          <div style={{ fontSize: '56px', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '8px' }}>
            ₹{payout.amount}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Credited to {payout.upiID || 'your UPI'}
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Claim ID</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{payout.claimID || claimID}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Transaction ID</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{payout.txnID}</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => setStep(1)} style={{ width: '100%' }}>
            File Another Claim
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ClaimFlow;
