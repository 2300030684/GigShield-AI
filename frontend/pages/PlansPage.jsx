import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { CheckCircle, MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import api from '../services/api.js';
import { TrustpayDB } from '../data/TrustpayData.js';
import { TrustpayDynamicPricing } from '../data/TrustpayAI_Engine.js';
import { DynamicPricingBanner } from '../components/AIEngineComponents.jsx';

const PlansPage = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [recommendedPlanId, setRecommendedPlanId] = useState('standard');
  const [zoneData, setZoneData] = useState({});
  const [selectedZone, setSelectedZone] = useState('Kondapur');
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [aiPricing, setAiPricing] = useState({});
  const [bonusCoverage, setBonusCoverage] = useState({});
  const [masterPricing, setMasterPricing] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes, plansRes] = await Promise.all([
          api.getMe(),
          api.getPlans(),
        ]);
        setUser(meRes.user);

        // Use API plans or fall back to TrustpayDB if backend is offline
        const rawPlans = plansRes.plans && plansRes.plans.length > 0
          ? plansRes.plans
          : Object.values(TrustpayDB.plans);
        setPlans(rawPlans);
        setRecommendedPlanId(plansRes.recommendedPlan || 'standard');
        setZoneData(plansRes);
        const zone = meRes.user?.zone || 'Kondapur';
        setSelectedZone(zone);

        // Calculate AI pricing for all plans after user data is available
        const userData = TrustpayDB.currentUser;
        const locationData = { zone };
        const pricing = {};
        const bonus = {};
        
        await Promise.all(['lite', 'standard', 'pro'].map(async (planType) => {
          pricing[planType] = await TrustpayDynamicPricing.calculatePersonalizedPremiumAsync(planType, userData, locationData);
          bonus[planType]   = TrustpayDynamicPricing.calculateBonusCoverageHours(userData, locationData);
        }));
        
        setAiPricing(pricing);
        setBonusCoverage(bonus);
        setMasterPricing(pricing['standard']); // use standard plan for the banner
        setLoading(false);
      } catch (err) {
        console.error('Plans Page load error:', err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectPlan = async (planId) => {
    try {
      await api.updateProfile({ plan: planId });
      const meRes = await api.getMe();
      setUser(meRes.user);
      alert(`Successfully switched to ${planId.toUpperCase()} plan.`);
    } catch (e) {
      console.error(e);
      alert('Failed to update plan.');
    }
  };

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Analyzing Coverage...</p>
        </div>
      </div>
    );
  }

  const activePlanId = user.plan || user.policy?.planType;
  const currentZoneData = zoneData || {};

  const faqs = [
    { q: "How soon do I get paid after a weather event?", a: `For Standard and Pro plans, payouts are processed automatically via UPI within 45 minutes. Lite plan takes up to 2 hours.` },
    { q: "Can I cancel my plan anytime?", a: "Yes. All our plans are weekly. You can turn off auto-renew at any time with no cancellation fees." },
    { q: "What counts as 'Heavy Rain' or 'Heatwave'?", a: "We use live OpenWeatherMap radar data. If rainfall exceeds 15mm/hr during your active hours, it triggers a claim." },
    { q: "Do I need to submit photos to claim?", a: "No! Trustpay is 100% zero-touch. Our AI detects the disruption in your zone and automatically triggers the payout." },
  ];

  // If user has an active plan, ONLY show that plan
  const plansToDisplay = activePlanId && plans.some(p => p.id === activePlanId) ? plans.filter(p => p.id === activePlanId) : plans;

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>
          {activePlanId ? 'Your Active Policy' : 'Choose Your Protection Plan'}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
          {activePlanId ? `Your dynamically priced coverage in ${user.city}.` : `AI-recommended based on your zone in ${user.city}, history, and pattern.`}
        </p>
      </div>

      <DynamicPricingBanner pricingData={masterPricing} />

      {!activePlanId && (
        <Card glow style={{ marginBottom: '32px', background: 'rgba(37, 99, 235, 0.03)', borderColor: 'var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🤖</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '18px', color: 'var(--accent-cyan)' }}>AI Recommendation for {user.name?.split(' ')[0]}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Based on your zone ({selectedZone}, Risk Score: {zoneData.userZoneRisk || 55}) and {user.activeDays}-day history, we recommend the <strong>{(plans.find(p => p.id === recommendedPlanId)?.name || 'Standard')} Plan</strong>.</div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)' }}>
          <MapPin size={20} color="var(--accent-cyan)" />
          <span style={{ color: 'var(--text-secondary)' }}>Your Active Zone:</span>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>{selectedZone}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: '32px', flexWrap: 'wrap', marginBottom: '80px' }}>
        {plansToDisplay.map(plan => {
          const isRecommended = recommendedPlanId === plan.id;
          const isPro = plan.id === 'pro';
          const isLite = plan.id === 'lite';
          
          return (
            <div 
              key={plan.id}
              style={{
                flex: '1 1 300px',
                maxWidth: isRecommended ? '400px' : '350px',
                transform: isRecommended ? 'scale(1.05) translateY(-10px)' : 'none',
                position: 'relative',
                background: isRecommended 
                  ? 'linear-gradient(145deg, rgba(37,99,235,0.06), rgba(5,150,105,0.04))'
                  : 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: isRecommended ? '2px solid rgba(0,224,255,0.4)' : '1px solid var(--border)',
                boxShadow: isRecommended 
                  ? '0 32px 80px -12px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' 
                  : '0 8px 32px -8px rgba(0,0,0,0.1)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isRecommended) e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = isRecommended 
                  ? '0 40px 100px -12px rgba(37,99,235,0.3)' 
                  : '0 16px 40px -8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isRecommended ? 'scale(1.05) translateY(-10px)' : 'none';
                e.currentTarget.style.boxShadow = isRecommended 
                  ? '0 32px 80px -12px rgba(37,99,235,0.2)' 
                  : '0 8px 32px -8px rgba(0,0,0,0.1)';
              }}
            >
              {isRecommended && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))' }} />
              )}
              {isRecommended && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'linear-gradient(135deg, var(--accent-cyan), #059669)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
                  RECOMMENDED
                </div>
              )}
              
              <h3 style={{ 
                fontSize: '22px', 
                fontWeight: 800, 
                letterSpacing: '0.5px',
                background: isPro ? 'linear-gradient(90deg, #F59E0B, #D97706)' : (isRecommended ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))' : 'var(--text-primary)'),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {plan.name.toUpperCase()} PLAN
              </h3>
              
              {/* AI Dynamic Price Block */}
            {aiPricing[plan.id] ? (
              <div className="plan-price-block">
                {aiPricing[plan.id].savedVsBase > 0 && (
                  <span className="plan-base-price-crossed">₹{aiPricing[plan.id].basePremium}</span>
                )}
                <div>
                  <span className="plan-ai-price">₹{aiPricing[plan.id].finalPremium}</span>
                  <span className="plan-period">/week</span>
                </div>
                {aiPricing[plan.id].savedVsBase > 0 && (
                  <div className="plan-savings-badge">AI saved you ₹{aiPricing[plan.id].savedVsBase}</div>
                )}
                {bonusCoverage[plan.id]?.bonusHours > 0 && (
                  <div className="bonus-hours-badge">
                    +{bonusCoverage[plan.id].bonusHours} bonus coverage hours
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>{bonusCoverage[plan.id].reason}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '48px', fontWeight: 700, margin: '16px 0' }}>
                ₹{plan.weeklyPremium}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/week</span>
              </div>
            )}
            
              <div style={{ marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px dashed var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Coverage up to</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹{plan.maxWeeklyCoverage}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/week</span>
                </div>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={18} color={isRecommended ? "var(--accent-cyan)" : "var(--accent-green)"} style={{ flexShrink: 0, marginTop: '2px' }}/> 
                  <span><strong style={{ color: 'var(--text-primary)' }}>Events:</strong> {plan.events.join(', ')}</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={18} color={isRecommended ? "var(--accent-cyan)" : "var(--accent-green)"} style={{ flexShrink: 0 }}/> 
                  <span><strong style={{ color: 'var(--text-primary)' }}>Max Claims:</strong> {plan.claimsPerMonth === 999 ? 'Unlimited' : plan.claimsPerMonth} / mo</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={18} color={isRecommended ? "var(--accent-cyan)" : "var(--accent-green)"} style={{ flexShrink: 0 }}/> 
                  <span><strong style={{ color: 'var(--text-primary)' }}>Payout:</strong> {plan.payoutTime}</span>
                </li>
                {plan.features.slice(0, 1).map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <CheckCircle size={18} color={isRecommended ? "var(--accent-cyan)" : "var(--accent-green)"} style={{ flexShrink: 0, marginTop: '2px' }}/> 
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            
              {(() => {
                const isActive = (user.plan || user.policy?.planType) === plan.id;
                return (
                  <button 
                    onClick={() => { if (!isActive) handleSelectPlan(plan.id); }}
                style={{ 
                  width: '100%', 
                  marginTop: 'auto',
                  padding: '16px',
                  borderRadius: '16px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: isActive ? 'default' : 'pointer',
                  border: isActive ? '1px solid var(--accent-cyan)' : (isPro ? '1px solid rgba(245, 158, 11, 0.4)' : (isRecommended ? 'none' : '1px solid var(--border)')),
                  background: isActive ? 'rgba(34, 211, 238, 0.1)' : (isRecommended ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))' : 'transparent'),
                  color: isActive ? 'var(--accent-cyan)' : (isRecommended ? 'white' : (isPro ? 'var(--accent-gold)' : 'var(--text-primary)')),
                  boxShadow: (!isActive && isRecommended) ? '0 12px 24px -8px rgba(37,99,235,0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-body)'
                }}
                onMouseOver={(e) => {
                  if (isActive) return;
                  if (isRecommended) e.currentTarget.style.boxShadow = '0 16px 32px -8px rgba(37,99,235,0.6)';
                  if (!isRecommended) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseOut={(e) => {
                  if (isActive) return;
                  if (isRecommended) e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(37,99,235,0.4)';
                  if (!isRecommended) e.currentTarget.style.background = 'transparent';
                }}
              >
                {isActive ? 'Current Plan — Active' : `Select ${plan.name}`}
              </button>
                );
              })()}
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => (
            <Card key={index} hover={false} style={{ padding: '0' }}>
              <button 
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                style={{
                  width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)',
                  padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '18px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)'
                }}
              >
                {faq.q}
                {expandedFaq === index ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedFaq === index && (
                <div className="animate-fade-in-up" style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
