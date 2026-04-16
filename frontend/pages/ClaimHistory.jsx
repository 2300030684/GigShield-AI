import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import api from '../services/api.js';
import { List, CloudRain, Wallet, CheckCircle, Clock, Sun, Wind, AlertTriangle, X, ChevronDown, Zap } from 'lucide-react';

// ── CLAIM MODAL ──────────────────────────────────────────────────────────────
const ClaimModal = ({ user, onClose, onSubmit }) => {
  const [step, setStep] = useState(1); // 1=select event, 2=confirm, 3=processing, 4=success
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [claimResult, setClaimResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const EVENTS = [
    { id: 'rain',    label: 'Heavy Rainfall',    icon: <CloudRain size={28} color="var(--accent-blue)" />, desc: 'Roads flooded, delivery impossible',      severity: 'HIGH',   amount: 254 },
    { id: 'heat',   label: 'Extreme Heat',       icon: <Sun size={28} color="var(--accent-orange)" />, desc: 'Unsafe temperatures above 42°C',         severity: 'HIGH',   amount: 236 },
    { id: 'flood',  label: 'Local Flood',        icon: <AlertTriangle size={28} color="var(--accent-cyan)" />, desc: 'Zone flooded — cannot exit area',        severity: 'CRITICAL',amount: 338 },
    { id: 'air',    label: 'Dangerous Air Quality', icon: <Wind size={28} color="var(--text-muted)" />, desc: 'AQI hazardous for outdoor workers',  severity: 'MEDIUM', amount: 182 },
    { id: 'storm',  label: 'Thunderstorm',       icon: <Zap size={28} color="var(--accent-gold)" />, desc: 'Lightning and strong winds',            severity: 'HIGH',   amount: 292 },
  ];

  const handleSelect = (event) => {
    setSelectedEvent(event);
    setStep(2);
  };

  const handleConfirm = async () => {
    setStep(3);
    // Simulate processing steps
    const labels = ['Verifying disruption...', 'Detecting location...', 'Calculating impact...', 'Fraud check...', 'Approving payout...'];
    for (let i = 0; i < labels.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setProgressLabel(labels[i]);
      setProgress(((i + 1) / labels.length) * 100);
    }
    const claimID = `TRP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 9000 + 1000)}`;
    setClaimResult({ claimID, payout: selectedEvent.amount, eventLabel: selectedEvent.label, eventIcon: selectedEvent.icon });
    setStep(4);
  };

  const severityColor = { HIGH: '#EA580C', CRITICAL: '#DC2626', MEDIUM: '#D97706' };

  return (
    <div className="zt-overlay">
      <div style={{
        background: 'var(--bg-card)', borderRadius: '24px', padding: '36px',
        width: '100%', maxWidth: '520px', margin: '16px',
        border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
        position: 'relative', maxHeight: '90vh', overflowY: 'auto'
      }}>
        {/* Close button */}
        {step < 3 && (
          <button onClick={onClose} style={{
            position: 'absolute', top: '20px', right: '20px', background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
          }}><X size={16} /></button>
        )}

        {/* STEP 1 — Choose event */}
        {step === 1 && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>File a Claim</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Select the disruption event that affected your earnings today
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {EVENTS.map(ev => (
                <button key={ev.id} onClick={() => handleSelect(ev)} style={{
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '14px', padding: '18px 16px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s', fontFamily: 'var(--font-body)'
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.background = 'var(--accent-cyan-dim)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{ev.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>{ev.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '10px' }}>{ev.desc}</div>
                  <div style={{
                    display: 'inline-block', fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px',
                    padding: '2px 8px', borderRadius: '6px',
                    background: `${severityColor[ev.severity]}15`, color: severityColor[ev.severity],
                    border: `1px solid ${severityColor[ev.severity]}30`
                  }}>{ev.severity}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Confirm */}
        {step === 2 && selectedEvent && (
          <>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, marginBottom: '20px', padding: 0 }}>
              ← Back
            </button>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px', display: 'block' }}>{selectedEvent.icon}</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>{selectedEvent.label}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedEvent.desc}</p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              {[
                ['Claim Type',     selectedEvent.label],
                ['Your Zone',      user?.zone || 'Kondapur'],
                ['Policy',         `Standard Plan (75% coverage)`],
                ['Est. Loss',      `₹${Math.round(selectedEvent.amount / 0.75)}`],
                ['Est. Payout',    `₹${selectedEvent.amount}`],
                ['Processing',     'Auto — Zero Touch'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              By confirming, you certify this event genuinely affected your earnings today.
            </p>

            <button onClick={handleConfirm} style={{
              width: '100%', padding: '14px', background: 'var(--accent-cyan)', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'var(--font-body)', transition: 'all 0.2s'
            }}>
              <Zap size={16} /> Confirm Claim — ₹{selectedEvent.amount}
            </button>
          </>
        )}

        {/* STEP 3 — Processing */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{selectedEvent?.icon}</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Processing Claim</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '32px' }}>Please wait — automated verification in progress</p>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border)' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-cyan), #059669)', borderRadius: '8px', transition: 'width 0.5s ease' }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{progressLabel}</p>
          </div>
        )}

        {/* STEP 4 — Success */}
        {step === 4 && claimResult && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {/* Confetti-style header */}
            <div style={{ fontSize: '52px', marginBottom: '8px', animation: 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              {claimResult.eventIcon || '✅'}
            </div>
            <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#059669', fontWeight: 700, marginBottom: '4px' }}>CLAIM APPROVED</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{claimResult.eventLabel}</div>

            {/* Payout amount */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.08), rgba(37,99,235,0.06))',
              border: '1px solid rgba(5,150,105,0.2)', borderRadius: '20px',
              padding: '24px', marginBottom: '20px'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>PAYOUT AMOUNT</div>
              <div style={{ fontSize: '56px', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                ₹{claimResult.payout}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                → Sending to {user?.upiID || 'your UPI'}
              </div>
            </div>

            {/* Claim details */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Claim ID</span>
                <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>{claimResult.claimID}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>✅ Paid</span>
              </div>
            </div>

            <button onClick={() => { onSubmit(claimResult); onClose(); }} style={{
              width: '100%', padding: '14px', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(37,99,235,0.3)'
            }}>
              ✓ Done — View in History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MAIN CLAIM HISTORY PAGE ───────────────────────────────────────────────────
const ClaimHistory = () => {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes, historyRes, statsRes] = await Promise.all([
          api.getMe(),
          api.getClaimHistory({ limit: 50 }),
          api.getClaimStats(),
        ]);
        setUser(meRes.user);
        setClaims(historyRes.claims || []);
        setStats(statsRes);
        setLoading(false);
      } catch (err) {
        console.error('Claim History load error:', err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const downloadCSV = () => {
    if (claims.length === 0) return;
    const headers = ['Date,Event,Zone,Payout,Status\n'];
    const rows = claims.map(c => `${c.displayDate || c.date},${c.event},${c.zone},${c.approvedPayout},${c.status}`);
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trustpay_claims_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleNewClaim = (result) => {
    const newClaim = {
      id: result.claimID, date: new Date().toISOString().slice(0, 10),
      displayDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      event: result.eventLabel || 'Disruption Event', zone: user?.zone || 'Kondapur',
      incomeLoss: Math.round(result.payout / 0.75), approvedPayout: result.payout,
      status: 'paid', payoutTime: 'Auto — Zero Touch'
    };

    // Save to local storage for MOCK_MODE persistence
    const claims = (() => { try { return JSON.parse(localStorage.getItem('tp_claims') || '[]'); } catch { return []; } })();
    claims.unshift(newClaim);
    localStorage.setItem('tp_claims', JSON.stringify(claims));

    setClaims(prev => [newClaim, ...prev]);
    setStats(prev => ({ ...prev, totalPaid: (prev.totalPaid || 0) + result.payout, totalClaims: (prev.totalClaims || 0) + 1 }));
  };

  const EVENT_ICONS = { 'Heavy Rainfall': '🌧', 'Heatwave': '🌡️', 'Road Block': '🚦', 'Extreme Heatwave': '🌡️', 'Local Flood Warning': '🌊', 'Traffic Block': '🚦', 'Storm': '⛈', 'default': '🌩' };
  const getIcon = (event) => Object.entries(EVENT_ICONS).find(([k]) => event?.includes(k.split(' ')[0]))?.[1] || '🌩';

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Clock size={48} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Retrieving Claim Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* Claim Modal */}
      {showClaimModal && (
        <ClaimModal user={user} onClose={() => setShowClaimModal(false)} onSubmit={handleNewClaim} />
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Claims History</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Automatic payouts for {user.name} · {user.city}</p>
            <button onClick={downloadCSV} style={{ 
              background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
              borderRadius: '8px', padding: '4px 12px', fontSize: '11px', fontWeight: 600,
              cursor: 'pointer', color: 'var(--accent-cyan)'
            }}>EXPORT CSV</button>
          </div>
        </div>
        <button onClick={() => setShowClaimModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 28px', background: 'var(--accent-cyan)', color: 'white',
          border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s',
          boxShadow: '0 4px 16px rgba(37,99,235,0.25)'
        }}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--accent-blue)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'var(--accent-cyan)'; e.currentTarget.style.transform = 'none'; }}
        >
          <Zap size={18} />
          File a Claim
        </button>
      </header>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <Card style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>TOTAL CLAIMED</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-cyan)' }}>₹{(stats.totalPaid || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Auto–credited to UPI</div>
        </Card>
        <Card style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>SETTLED EVENTS</div>
          <div style={{ fontSize: '28px', fontWeight: 800 }}>{stats.totalClaims || claims.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--accent-green)', marginTop: '4px' }}>98% success rate</div>
        </Card>
        <Card style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>UNPAID LOSSES</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-green)' }}>₹0</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Zero out-of-pocket</div>
        </Card>
      </div>

      {/* Claims Table */}
      <div style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: '20px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <div>DATE</div><div>EVENT & DETAILS</div><div>ZONE</div><div>PAYOUT</div><div style={{ textAlign: 'right' }}>STATUS</div>
        </div>

        {claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>🌤</div>
            <p style={{ fontWeight: 600, marginBottom: '8px' }}>No claims yet — your protection is active</p>
            <button onClick={() => setShowClaimModal(true)} style={{
              marginTop: '16px', padding: '10px 24px', background: 'var(--accent-cyan)', color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}>File First Claim</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {claims.map((claim, idx) => (
              <div key={claim.id || idx} style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: '20px',
                padding: '20px 24px', borderBottom: idx < claims.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center', transition: 'background 0.15s',
                background: 'transparent'
              }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{claim.displayDate || claim.date}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', fontSize: '18px', flexShrink: 0 }}>
                    {getIcon(claim.event)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{claim.event}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{claim.payoutTime || 'Auto-detected'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{claim.zone}</div>

                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>₹{claim.approvedPayout}</div>

                <div style={{ textAlign: 'right' }}>
                  <Badge variant={claim.status === 'paid' ? 'green' : 'amber'}>
                    {claim.status === 'paid' ? 'SETTLED' : 'PROCESSING'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPI Footer */}
      <div style={{ marginTop: '40px', padding: '32px', background: 'var(--bg-secondary)', borderRadius: '20px', textAlign: 'center', border: '1px dashed var(--border)' }}>
        <Wallet size={32} color="var(--accent-cyan)" style={{ marginBottom: '16px' }} />
        <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Auto-Pay to UPI</h4>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          All payouts are automatically sent to <strong>{user.upiID || 'your registered UPI'}</strong> within 1 hour.
        </p>
        <Button variant="outline" style={{ background: 'white' }}>Update Payment Method</Button>
      </div>
    </div>
  );
};

export default ClaimHistory;
