import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { CloudRain, Wind, AlertCircle, ShieldAlert, CheckCircle, Activity, Zap } from 'lucide-react';

// Custom hook for smooth number counting animation
const useCounter = (target, duration = 1.5, start = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // easeOutExpo easing function for dramatic slow-down at the end
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [target, duration, start]);

  // Reset to 0 if not started
  useEffect(() => {
    if (!start) setCount(0);
  }, [start]);

  return count;
};

const StormSimulator = () => {
  // Stage 0: Calm, 1: Flash, 2: Metrics Spike, 3: AI Surge, 4: Claim Verify, 5: Paid
  const [stage, setStage] = useState(0);

  // Counters only start when their specific stage is reached
  const rain = useCounter(145, 2, stage >= 2);
  const aqi = useCounter(380, 2, stage >= 2);
  const wind = useCounter(72, 2, stage >= 2);
  const risk = useCounter(96, 1.5, stage >= 3);

  const startSimulation = () => {
    if (stage > 0) {
      setStage(0);
      return;
    }
    
    // The Orchestrator
    setStage(1); // Lightning Flash
    setTimeout(() => setStage(2), 200);  // Webhook metrics start driving up
    setTimeout(() => setStage(3), 2000); // AI model catches anomaly and spikes
    setTimeout(() => setStage(4), 3500); // Smart Contract threshold met -> Trigger
    setTimeout(() => setStage(5), 5500); // Payment clears
  };

  const isStorm = stage >= 1;
  const isTriggered = stage >= 4;
  const isPaid = stage >= 5;

  return (
    <div style={{
      minHeight: '80vh',
      background: isStorm ? '#020617' : 'var(--bg-primary)',
      transition: 'background 0.5s ease',
      borderRadius: '24px',
      padding: '40px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid var(--border)'
    }}>
      {/* ⚡ THE LIGHTNING FLASH */}
      {stage === 1 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0, 0.4, 0] }}
          transition={{ duration: 0.4, times: [0, 0.1, 0.3, 0.6, 1] }}
          style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 50, pointerEvents: 'none' }}
        />
      )}

      {/* HEADER SECTION */}
      <div style={{ marginBottom: '48px', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: isStorm ? '#F8FAFC' : 'var(--text-primary)', transition: 'color 0.5s ease' }}>
          Real-time Engine Simulation
        </h1>
        <p style={{ color: isStorm ? '#94A3B8' : 'var(--text-secondary)', transition: 'color 0.5s ease', fontSize: '16px', maxWidth: '600px', marginTop: '8px' }}>
          Observe how the platform ingests meteorological webhook data, processes AI risk inference, and executes parametric payouts with zero human intervention.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '40px', position: 'relative', zIndex: 10 }}>
        
        {/* COLUMN 1: WEBHOOK DATA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isStorm ? '#475569' : 'var(--text-muted)' }}>
            1. Webhook Sensors
          </div>
          
          <Card glow={isStorm} style={{ borderColor: isStorm ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)', background: isStorm ? '#0F172A' : 'var(--bg-card)', transition: 'all 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CloudRain size={28} color={stage >= 2 ? '#EF4444' : '#38BDF8'} style={{ transition: 'color 0.5s ease' }} />
                <span style={{ fontWeight: 600, fontSize: '18px', color: isStorm ? '#F1F5F9' : 'inherit' }}>Rainfall</span>
              </div>
              <div style={{ fontSize: '32px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: stage >= 2 ? '#EF4444' : (isStorm ? '#F1F5F9' : 'var(--text-primary)'), fontVariantNumeric: 'tabular-nums' }}>
                {rain}<span style={{ fontSize: '16px', color: 'var(--text-muted)', marginLeft: '4px' }}>mm</span>
              </div>
            </div>
          </Card>

          <Card glow={isStorm} style={{ borderColor: isStorm ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)', background: isStorm ? '#0F172A' : 'var(--bg-card)', transition: 'all 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Activity size={28} color={stage >= 2 && aqi > 300 ? '#EF4444' : '#10B981'} style={{ transition: 'color 0.5s ease' }} />
                <span style={{ fontWeight: 600, fontSize: '18px', color: isStorm ? '#F1F5F9' : 'inherit' }}>AQI Index</span>
              </div>
              <div style={{ fontSize: '32px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: stage >= 2 && aqi > 300 ? '#EF4444' : (isStorm ? '#F1F5F9' : 'var(--text-primary)'), fontVariantNumeric: 'tabular-nums' }}>
                {aqi}
              </div>
            </div>
          </Card>

          <Card glow={isStorm} style={{ borderColor: isStorm ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)', background: isStorm ? '#0F172A' : 'var(--bg-card)', transition: 'all 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Wind size={28} color={stage >= 2 && wind > 50 ? '#F59E0B' : '#64748B'} style={{ transition: 'color 0.5s ease' }} />
                <span style={{ fontWeight: 600, fontSize: '18px', color: isStorm ? '#F1F5F9' : 'inherit' }}>Wind Gush</span>
              </div>
              <div style={{ fontSize: '32px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: stage >= 2 && wind > 50 ? '#F59E0B' : (isStorm ? '#F1F5F9' : 'var(--text-primary)'), fontVariantNumeric: 'tabular-nums' }}>
                {wind}<span style={{ fontSize: '16px', color: 'var(--text-muted)', marginLeft: '4px' }}>km/h</span>
              </div>
            </div>
          </Card>
        </div>

        {/* COLUMN 2: AI INFERENCE ENGINE */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isStorm ? '#475569' : 'var(--text-muted)' }}>
            2. ML Inference Engine
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            {/* Pulsing ring during critical stage */}
            <motion.div 
               animate={stage === 3 ? { scale: [1, 1.05, 1] } : {}}
               transition={{ repeat: Infinity, duration: 1.2 }}
               style={{ 
                  position: 'relative', width: '260px', height: '260px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  background: isStorm ? 'rgba(15, 23, 42, 0.8)' : 'var(--bg-secondary)', 
                  borderRadius: '50%',
                  boxShadow: stage >= 3 ? '0 0 50px rgba(239, 68, 68, 0.25)' : 'none',
                  border: `6px solid ${stage >= 3 ? '#EF4444' : (isStorm ? '#334155' : 'var(--border)')}`,
                  transition: 'border 0.3s ease, background 0.5s ease'
               }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: isStorm ? '#94A3B8' : 'var(--text-secondary)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Score</div>
                <div style={{ fontSize: '72px', fontFamily: 'var(--font-mono, monospace)', fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: stage >= 3 ? '#EF4444' : (isStorm ? '#F1F5F9' : 'var(--text-primary)'), lineHeight: 1, transition: 'color 0.3s' }}>
                  {risk}<span style={{ fontSize: '32px' }}>%</span>
                </div>
                {stage >= 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '16px', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.05em' }}>
                    <AlertCircle size={16} /> CRITICAL
                  </motion.div>
                )}
              </div>
              
              {/* Dynamic SVG Progress Ring */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="130" cy="130" r="124" fill="none" stroke={stage >= 3 ? '#EF4444' : '#38BDF8'} strokeWidth="6" 
                   strokeDasharray="780" strokeDashoffset={780 - (780 * risk) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }} strokeLinecap="round" />
              </svg>
            </motion.div>
          </div>

          <Button 
             variant={stage > 0 ? "outline" : "primary"} 
             onClick={startSimulation}
             style={{ 
               width: '100%', padding: '20px', fontSize: '18px', fontWeight: 700,
               background: stage > 0 ? 'transparent' : undefined,
               color: stage > 0 ? '#EF4444' : undefined,
               borderColor: stage > 0 ? '#EF4444' : undefined,
               borderWidth: stage > 0 ? '2px' : undefined
             }}
          >
            {stage > 0 ? 'Reset Engine' : <><Zap size={20} style={{ marginRight: '10px' }} /> Inject Storm Disruption</>}
          </Button>
        </div>

        {/* COLUMN 3: SMART CONTRACT OUTPUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isStorm ? '#475569' : 'var(--text-muted)' }}>
            3. Smart Contract Automation
          </div>

          <motion.div
           style={{ flex: 1, perspective: 1200 }}
           animate={{ rotateY: isTriggered ? 180 : 0 }}
           transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
          >
             <div style={{ 
               width: '100%', height: '100%', minHeight: '360px', position: 'relative', transformStyle: 'preserve-3d'
             }}>
               {/* FRONT (Monitoring State) */}
               <Card style={{ 
                 position: 'absolute', inset: 0, backfaceVisibility: 'hidden', 
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                 background: isStorm ? '#0F172A' : 'var(--bg-card)',
                 borderColor: isStorm ? '#334155' : 'var(--border)',
                 transition: 'all 0.5s ease'
               }}>
                 <ShieldAlert size={56} color={isStorm ? '#475569' : 'var(--border)'} style={{ marginBottom: '24px', transition: 'color 0.5s ease' }} />
                 <h3 style={{ color: isStorm ? '#94A3B8' : 'var(--text-secondary)', fontSize: '20px', transition: 'color 0.5s ease' }}>Monitoring Zone</h3>
                 <p style={{ fontSize: '14px', color: isStorm ? '#475569' : 'var(--text-muted)', marginTop: '8px', textAlign: 'center', padding: '0 24px', transition: 'color 0.5s ease' }}>
                    Contract is sleeping until parameters reach critical threshold.
                 </p>
               </Card>

               {/* BACK (Payout State) */}
               <Card glow style={{ 
                 position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                 borderColor: isPaid ? '#10B981' : '#F59E0B',
                 background: isPaid ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.08)'
               }}>
                 {isPaid ? (
                   <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ textAlign: 'center' }}>
                     <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 24px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)' }}>
                       <CheckCircle size={40} />
                     </div>
                     <h3 style={{ color: '#10B981', fontSize: '22px', marginBottom: '8px', fontWeight: 800 }}>Parametric Payout Done</h3>
                     <div style={{ fontSize: '42px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: isStorm ? '#F8FAFC' : 'var(--text-primary)', marginBottom: '16px' }}>₹1,500</div>
                     <Badge variant="green" style={{ padding: '6px 12px' }}>API ROUTED TO BANK</Badge>
                   </motion.div>
                 ) : (
                   <div style={{ textAlign: 'center' }}>
                     <Activity size={56} color="#F59E0B" style={{ margin: '0 auto 24px' }} className="animate-pulse" />
                     <h3 style={{ color: '#F59E0B', fontSize: '22px', marginBottom: '12px', fontWeight: 800 }}>Trigger Activated ⚡</h3>
                     <p style={{ fontSize: '14px', color: isStorm ? '#94A3B8' : 'var(--text-secondary)' }}>Verifying and drafting transaction...</p>
                   </div>
                 )}
               </Card>
             </div>
          </motion.div>
        
        </div>
      </div>
    </div>
  );
};

export default StormSimulator;
