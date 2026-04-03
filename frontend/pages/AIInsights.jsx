import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, MapPin, TrendingUp, CloudRain, Map, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api.js';

const AIInsights = () => {
  const [user, setUser] = useState(null);
  const [insights, setInsights] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyRisk, setHourlyRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meRes, insightsRes, forecastRes] = await Promise.all([
          api.getMe(),
          api.getInsights(),
          api.getEarningsForecast().catch(() => ({ forecast: [] })),
        ]);
        setUser(meRes.user);
        setInsights(insightsRes);
        setHourlyRisk(insightsRes.hourlyRisk || []);
        setForecastData(forecastRes.forecast || []);
        setLoading(false);
      } catch (err) {
        console.error('AI Insights load error:', err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !user || !insights) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Analyzing Platform Data...</p>
        </div>
      </div>
    );
  }

  const dashboardInsight = { riskScore: insights.riskScore, riskLevel: insights.riskLevel, riskReason: insights.riskReason };


  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🤖 AI Intelligence Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Powered by Trustpay's proprietary risk model for {user.city} — updated every 15 mins</p>
      </header>

      {/* Top row - 3 AI metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <Card glow>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Network Risk — {user.zone}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
             <div style={{ position: 'relative', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="72" height="72" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-secondary)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={dashboardInsight.riskLevel === 'HIGH' ? 'var(--accent-red)' : 'var(--accent-orange)'} strokeWidth="3" strokeDasharray={`${dashboardInsight.riskScore}, 100`} />
                </svg>
                <span style={{ position: 'absolute', fontSize: '18px', fontWeight: 700, color: dashboardInsight.riskLevel === 'HIGH' ? 'var(--accent-red)' : 'var(--accent-orange)' }}>{dashboardInsight.riskScore}</span>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{dashboardInsight.riskLevel}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dashboardInsight.riskReason}</div>
              </div>
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Today's Expected Floor</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>₹{forecastData[0]?.protectedFloor || 900} – ₹{forecastData[0]?.expectedEarnings || 1200}</div>
          <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: '0%', width: '75%', height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))', borderRadius: '4px' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px', color: 'var(--text-muted)' }}>
            <span>Protected Min (75%)</span>
            <span>Uncapped Potential</span>
          </div>
        </Card>

        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Best Earning Window</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(0, 255, 156, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Clock color="var(--accent-green)" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-green)' }}>{insights.safeHours || '7AM-12PM'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Optimum {user.platform} traffic</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Hourly Risk Timeline */}
      <Card style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Hourly Risk Timeline (Real-time)</h3>
        <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '16px', gap: '4px' }}>
          {hourlyRisk.map((item, idx) => (
            <div key={idx} style={{ flex: 1, minWidth: '80px', textAlign: 'center' }}>
              <div style={{ 
                height: `${item.risk / 2 + 10}px`, 
                marginTop: `${50 - item.risk / 2}px`,
                background: item.level === 'high' ? 'var(--accent-red)' : item.level === 'medium' ? 'var(--accent-orange)' : 'var(--accent-green)',
                opacity: 0.8,
                borderRadius: '4px',
                marginBottom: '12px',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}>
                {new Date().getHours() === parseInt(item.hour) && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 2, height: 80, background: 'var(--accent-cyan)' }}></div>}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.hour}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>{item.level}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        {/* AI Insight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card glow style={{ padding: '20px' }}>
            <CloudRain size={24} color="var(--accent-cyan)" style={{ marginBottom: '16px' }} />
            <h4 style={{ marginBottom: '8px' }}>Severe Storm Risk</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>The AI model predicts a 84% probability of intense storm activity in {user.zone} during evening peak.</p>
            <Badge variant="red">CRITICAL RISK</Badge>
          </Card>
          
          <Card glow style={{ padding: '20px' }}>
            <Map size={24} color="var(--accent-cyan)" style={{ marginBottom: '16px' }} />
            <h4 style={{ marginBottom: '8px' }}>Zone Dispatch</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Relocating to Banjara Hills is currently 22% safer with higher earning potential tonight.</p>
            <Button variant="ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>Show Routes</Button>
          </Card>

          <Card glow style={{ padding: '20px' }}>
            <TrendingUp size={24} color="var(--accent-green)" style={{ marginBottom: '16px' }} />
            <h4 style={{ marginBottom: '8px' }}>Earning Resilience</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Your current {(user.plan || 'standard').toUpperCase()} plan covers 75% of losses today. Risk volatility is minimal until 4 PM.</p>
            <Badge variant="green">STABLE FLOW</Badge>
          </Card>

          <Card glow style={{ padding: '20px' }}>
            <AlertTriangle size={24} color="var(--accent-orange)" style={{ marginBottom: '16px' }} />
            <h4 style={{ marginBottom: '8px' }}>Road Disruption</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Political rally in HITEC City may cause 45-min delays. Trustpay AI compensates for this delay.</p>
            <Badge variant="amber">SUPPORTED</Badge>
          </Card>
        </div>

        {/* Earnings Forecast Chart */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px' }}>AI Revenue Forecast (Next 7 Days)</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Model V2.4 Active</div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                   <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip 
                   contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-card)' }}
                />
                <Area type="monotone" dataKey="expectedEarnings" stroke="var(--accent-cyan)" fill="url(#colorExpected)" strokeWidth={2} name="Forecasted Income" />
                <Area type="monotone" dataKey="protectedFloor" stroke="var(--accent-cyan)" fill="none" strokeWidth={1} strokeDasharray="5 5" name="Guaranteed Floor" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 2, background: 'var(--accent-cyan)' }}></div> Forecasted Income
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 2, borderTop: '2px dashed var(--accent-cyan)' }}></div> Guaranteed Floor (75%)
             </div>
          </div>
        </Card>
      </div>

      <h3 style={{ fontSize: '18px', margin: '48px 0 24px' }}>Dynamic Risk Heatmap — {user.city}</h3>
      <Card style={{ height: '400px', padding: 0, overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
         <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', zIndex: 10 }}>
            <Card style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
               <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>AI LEGEND</div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'rgba(0, 255, 156, 0.4)' }}></div> Low Risk Zone
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'rgba(255, 140, 66, 0.4)' }}></div> Moderate Warning
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'rgba(255, 77, 106, 0.4)' }}></div> Active Disruption
                  </div>
               </div>
            </Card>
         </div>
         
         <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(8, 1fr)', gap: '4px', padding: '20px', background: 'var(--bg-secondary)' }}>
            {[...Array(96)].map((_, i) => {
              const types = [0, 1, 2, 0, 0, 1, 0, 2, 0, 0, 1, 0];
              const colors = ['rgba(0, 255, 156, 0.1)', 'rgba(255, 140, 66, 0.1)', 'rgba(255, 77, 106, 0.1)'];
              const borderColors = ['var(--accent-green)', 'var(--accent-orange)', 'var(--accent-red)'];
              const type = types[i % types.length];
              const isUserZone = i === 42;
              
              return (
                <div key={i} style={{ 
                  background: colors[type], 
                  border: isUserZone ? '2px solid var(--accent-cyan)' : `1px solid ${borderColors[type]}22`,
                  borderRadius: '4px',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }} className="map-cell">
                   {isUserZone && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                         <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)' }}></div>
                      </div>
                   )}
                </div>
              );
            })}
         </div>
      </Card>
    </div>
  );
};

export default AIInsights;
