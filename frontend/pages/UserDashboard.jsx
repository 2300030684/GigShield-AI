import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Shield, AlertCircle, Loader2, MapPin, Wind, Thermometer, Droplets, Brain, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { DisruptionBanner, ZeroTouchOverlay, useDashboardTriggers, H3RiskMap } from '../components/AIEngineComponents.jsx';
import { h3Index } from '../utils/h3_simulator.js';

// ══════════════════════════════════════════════════════
//  WEATHER + ML RISK STRIP COMPONENT
//  Shows live: temp, rainfall, AQI, ML risk score
// ══════════════════════════════════════════════════════
const WeatherRiskStrip = ({ lat, lng }) => {
  const [weather, setWeather] = useState(null);
  const [mlRisk, setMlRisk] = useState(null);
  const [stripLoading, setStripLoading] = useState(true);

  useEffect(() => {
    const fetchStripData = async () => {
      try {
        const WEATHER_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'fd75a6170acc3ea58cc247f5682253e6';
        const useLat = lat || 17.4726;
        const useLng = lng || 78.3572;

        // Fetch weather directly from OWM
        const [weatherRes, aqiRes] = await Promise.allSettled([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${useLat}&lon=${useLng}&appid=${WEATHER_KEY}&units=metric`)
            .then(r => r.json()),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${useLat}&lon=${useLng}&appid=${WEATHER_KEY}`)
            .then(r => r.json()),
        ]);

        const w = weatherRes.status === 'fulfilled' ? weatherRes.value : null;
        const a = aqiRes.status === 'fulfilled' ? aqiRes.value : null;

        const temp = w?.main?.temp ?? 30;
        const rain = w?.rain?.['1h'] ?? 0;
        const windSpeed = w?.wind?.speed ?? 0;
        const humidity = w?.main?.humidity ?? 60;
        const aqi = a?.list?.[0]?.main?.aqi ?? 2;
        const aqiScaled = aqi * 50;
        const condition = w?.weather?.[0]?.main ?? 'Clear';

        setWeather({ temp, rain, windSpeed, humidity, aqi, aqiScaled, condition });

        // Call ML prediction via backend
        try {
          const mlRes = await api.runPrediction({ lat: useLat, lng: useLng });
          setMlRisk(mlRes);
        } catch (_) {
          // Fallback rule-based risk
          const riskScore = Math.min((rain / 120 * 0.4) + (Math.max(temp - 28, 0) / 22 * 0.3) + (aqiScaled / 200 * 0.3), 1);
          setMlRisk({
            risk_score: riskScore,
            risk_tier: riskScore > 0.65 ? 'HIGH' : riskScore > 0.35 ? 'MEDIUM' : 'LOW',
            model_type: 'CLIENT_FALLBACK'
          });
        }
      } catch (err) {
        console.warn('WeatherRiskStrip fetch failed:', err);
      } finally {
        setStripLoading(false);
      }
    };

    fetchStripData();
    // Refresh every 10 minutes
    const interval = setInterval(fetchStripData, 600_000);
    return () => clearInterval(interval);
  }, [lat, lng]);

  const riskColor = mlRisk?.risk_tier === 'HIGH' ? '#EF4444'
                  : mlRisk?.risk_tier === 'MEDIUM' ? '#F59E0B'
                  : '#10B981';

  const aqiLabel = weather ? (
    weather.aqi === 1 ? 'Good' :
    weather.aqi === 2 ? 'Fair' :
    weather.aqi === 3 ? 'Moderate' :
    weather.aqi === 4 ? 'Poor' : 'Very Poor'
  ) : '---';

  const aqiColor = weather ? (
    weather.aqi <= 2 ? '#10B981' :
    weather.aqi === 3 ? '#F59E0B' : '#EF4444'
  ) : '#888';

  if (stripLoading) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(16,185,129,0.06) 100%)',
      border: '1px solid rgba(6,182,212,0.2)',
      borderRadius: '16px',
      padding: '14px 24px',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '0',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Live dot */}
      <div style={{ position: 'absolute', top: 14, right: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>LIVE</span>
      </div>

      {/* Weather metrics */}
      {[
        {
          icon: <Thermometer size={16} />,
          label: 'Temp',
          value: weather ? `${weather.temp.toFixed(1)}°C` : '---',
          color: weather?.temp > 42 ? '#EF4444' : '#F59E0B',
        },
        {
          icon: <Droplets size={16} />,
          label: 'Rainfall',
          value: weather ? `${weather.rain.toFixed(1)}mm` : '---',
          color: weather?.rain > 50 ? '#EF4444' : '#06B6D4',
        },
        {
          icon: <Wind size={16} />,
          label: 'Wind',
          value: weather ? `${(weather.windSpeed * 3.6).toFixed(0)} km/h` : '---',
          color: '#94A3B8',
        },
        {
          icon: <span style={{ fontSize: 16 }}>☁</span>,
          label: `AQI (${aqiLabel})`,
          value: weather ? `${weather.aqiScaled}` : '---',
          color: aqiColor,
        },
      ].map((m, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
        }}>
          <span style={{ color: m.color }}>{m.icon}</span>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        </div>
      ))}

      {/* ML Risk Score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 20px',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        marginLeft: 'auto',
      }}>
        <Brain size={16} style={{ color: riskColor }} />
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>ML Risk Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: riskColor }}>
              {mlRisk ? (mlRisk.risk_score * 100).toFixed(0) : '--'}/100
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: `${riskColor}20`, color: riskColor,
              padding: '2px 8px', borderRadius: 6, border: `1px solid ${riskColor}40`
            }}>
              {mlRisk?.risk_tier ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [claimStats, setClaimStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zeroTouchTrigger, setZeroTouchTrigger] = useState(null);
  const { activeTriggers, dismissTrigger } = useDashboardTriggers();

  useEffect(() => {
    const syncLocationAndLoad = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            try {
              // Sync location to backend using the specific verify endpoint
              await api.verifyLocation(latitude, longitude, accuracy);
            } catch (e) {
              console.warn("Location verification failed:", e);
            }
            await loadDataGrid();
          }, (geoErr) => {
            console.warn("Geolocation failed:", geoErr);
            loadDataGrid();
          }, { enableHighAccuracy: true, timeout: 10000 });
        } else {
          loadDataGrid();
        }
      } catch (err) {
        console.error('Dashboard setup error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const loadDataGrid = async () => {
      try {
        const [meRes, statsRes, forecastRes] = await Promise.all([
          api.getMe(),
          api.getClaimStats(),
          api.getEarningsForecast().catch(() => ({ forecast: [] })),
        ]);

        setUser(meRes.user);
        setPolicy(meRes.policy);
        setClaimStats(statsRes);
        setWeeklyData(forecastRes.forecast || []);

        // ── REDIRECT TO ONBOARDING IF NOT COMPLETE ──
        if (meRes.user && meRes.user.isOnboardingComplete === false) {
           navigate('/onboarding');
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    syncLocationAndLoad();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px' }}>
        <AlertCircle size={48} color="var(--accent-red)" />
        <p style={{ color: 'var(--text-secondary)' }}>{error || 'Failed to load dashboard'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const totalProtected = claimStats?.totalPaid || 0;
  const totalEarnings = (user.earningHistory || []).reduce((sum, e) => sum + e.amount, 0) || 0;
  const weeklyProtected = claimStats?.thisWeekProtected || 0;
  const weeklyEarnings = claimStats?.thisWeekEarnings || 0;
  const successRate = claimStats?.claimSuccessRate || 0;
  const recentClaims = claimStats?.recentClaims || [];
  const policyActive = policy || user.activePlan !== 'none';

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* ── WEATHER + ML RISK STRIP ── */}
      <WeatherRiskStrip lat={user.latitude} lng={user.longitude} />

      {/* ── DISRUPTION BANNERS (auto-trigger) ── */}
      {activeTriggers.map(trigger => (
        <DisruptionBanner
          key={trigger.triggerID}
          trigger={trigger}
          onClaim={(t) => setZeroTouchTrigger(t)}
          onDismiss={() => dismissTrigger(trigger.triggerID)}
        />
      ))}

      {/* ── ZERO-TOUCH CLAIM OVERLAY ── */}
      {zeroTouchTrigger && (
        <ZeroTouchOverlay
          trigger={zeroTouchTrigger}
          onComplete={(result) => {
            setZeroTouchTrigger(null);
            dismissTrigger(zeroTouchTrigger.triggerID);
          }}
        />
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '32px', margin: 0 }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name?.split(' ')[0] || 'there'} 👋
            </h1>
            {user.platformBadge && (
              <div className="platform-badge" style={{ 
                background: `${user.platformBadge.color}15`, 
                border: `1px solid ${user.platformBadge.color}33`,
                color: user.platformBadge.color,
                fontSize: '11px',
                padding: '4px 12px'
              }}>
                {user.platformBadge.label}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <MapPin size={14} />
            <span>{user.zone || 'Zone'}, {user.city} — {user.platform || 'Platform'} Verified</span>
            <span style={{ margin: '0 8px', opacity: 0.2 }}>|</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontWeight: 600 }}>HEX: {h3Index.getHexForLocation(user.zone, user.city)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {policyActive ? (
            <Badge variant="green" style={{ fontSize: '14px', padding: '8px 16px' }}>
              🛡 {(user.plan || policy?.planType || 'Standard').toUpperCase()} ACTIVE
            </Badge>
          ) : (
            <Button variant="primary" onClick={() => navigate('/plans')}>Activate Plan</Button>
          )}
        </div>
      </header>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <Card glow>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>THIS WEEK PROTECTED</div>
          <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px', color: 'var(--accent-cyan)' }}>
            ₹{weeklyProtected.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent-green)' }}>
            <ArrowUpRight size={14} /> Auto-credited to UPI
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>TOTAL EARNINGS PROTECTED</div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>₹{totalProtected.toLocaleString()}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {claimStats?.totalClaims || 0} claims paid
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>PROTECTION SCORE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{user.protectionScore || 50}</div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>/100</div>
              <Badge variant={user.protectionScore > 80 ? 'green' : user.protectionScore > 60 ? 'cyan' : 'amber'}>
                {user.protectionScore > 80 ? 'EXCELLENT' : user.protectionScore > 60 ? 'GOOD' : 'FAIR'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>TRUSTPAY REWARDS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⭐</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>₹{user.rewardsBalance || 450}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loyalty Credits</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
            Next Reward: 4 days remaining
          </div>
        </Card>
      </div>

      {/* Maps & Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', marginBottom: '32px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px' }}>AI Revenue Forecast (7 Days)</h3>
            <Badge variant="cyan">Live Model</Badge>
          </div>
          {weeklyData.length > 0 ? (
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="expectedEarnings" stroke="var(--accent-cyan)" fill="url(#colorExpected)" strokeWidth={2} name="Expected" />
                  <Area type="monotone" dataKey="protectedFloor" stroke="var(--accent-green)" fill="none" strokeWidth={1} strokeDasharray="5 5" name="Protected Floor" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <p>Forecast loading...</p>
            </div>
          )}
        </Card>

        <Card glow style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px' }}>Live H3 Risk Grid</h3>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-green)', animation: 'pulse 2s infinite' }} />
          </div>
          <H3RiskMap 
            city={user.city} 
            zone={user.zone} 
            isDisrupted={activeTriggers.some(t => t.triggerID === 'TRIGGER_RAIN' || t.triggerID === 'TRIGGER_FLOOD')} 
          />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
            📡 Real-time street-level spatial matching active
          </div>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Recent Claims</h3>
          <Button variant="ghost" onClick={() => navigate('/claim')} style={{ color: 'var(--accent-cyan)' }}>View All History</Button>
        </div>
        {recentClaims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--text-muted)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Shield size={40} style={{ opacity: 0.2 }} />
            </div>
            <p style={{ fontSize: '15px' }}>Your protection is active. No claims detected yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentClaims.map((claim, idx) => (
              <div key={idx} className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '1px solid var(--border)' }}>
                    {claim.event === 'Heavy Rain' || claim.event === 'Flood' ? '🌧' : claim.event === 'Storm' ? '⛈' : claim.event === 'Heatwave' ? '☀️' : '🌡'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{claim.event}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{claim.displayDate} • {claim.zone}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '18px', color: claim.status === 'paid' ? 'var(--accent-green)' : 'var(--accent-orange)', marginBottom: '4px' }}>
                    {claim.status === 'paid' ? `+₹${claim.approvedPayout}` : claim.status}
                  </div>
                  <Badge variant={claim.status === 'paid' ? 'green' : 'amber'} style={{ fontSize: '10px', padding: '2px 8px' }}>
                    {claim.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserDashboard;
