import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Shield, TrendingUp, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import api from '../services/api.js';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await api.getAdminMetrics();
        setAdminData(res.adminData);
        setAdminAnalytics(res.adminAnalytics);
      } catch (err) {
        console.error('Admin metrics error:', err);
        setError(err.message);
        // Fallback to default state so UI renders
        setAdminData({
          totalUsers: 0, activePolicies: 0, claimsThisMonth: 0,
          avgPayout: 0, fraudPreventedValue: 0, fraudPreventedCases: 0,
          platformRevenue: 0, cityDistribution: [], zonesFlagged: 0,
          totalUsersGrowth: '+0%', activePoliciesPercent: '0%',
        });
        setAdminAnalytics({
          claimsTrend: [],
          fraudStatsByType: [
            { name: 'GPS Mismatch',    value: 42, color: '#FF4D6A' },
            { name: 'Velocity Fraud',  value: 28, color: '#FF8C42' },
            { name: 'Duplicate Claim', value: 19, color: '#FFD166' },
            { name: 'Other',           value: 11, color: '#8899BB' },
          ],
          riskSummary: { low: 45, medium: 38, high: 17 },
          fraudCases: [],
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px', color: 'var(--text-secondary)' }}>
        <Loader2 size={48} className="animate-spin" style={{ opacity: 0.5 }} />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!adminData) return null;

  const kpiCards = [
    { label: 'Total Users', value: adminData.totalUsers?.toLocaleString() || '0', sub: adminData.totalUsersGrowth || '+0%', icon: Users, color: 'var(--accent-cyan)' },
    { label: 'Active Policies', value: adminData.activePolicies?.toLocaleString() || '0', sub: adminData.activePoliciesPercent || '0% activation', icon: Shield, color: 'var(--accent-green)' },
    { label: 'Claims This Month', value: adminData.claimsThisMonth?.toLocaleString() || '0', sub: `Avg ₹${adminData.avgPayout || 0}`, icon: Activity, color: 'var(--accent-orange)' },
    { label: 'Fraud Prevented', value: `₹${(adminData.fraudPreventedValue || 0).toLocaleString()}`, sub: `${adminData.fraudPreventedCases || 0} cases flagged`, icon: AlertTriangle, color: 'var(--accent-red)' },
    { label: 'Platform Revenue', value: `₹${(adminData.platformRevenue || 0).toLocaleString()}`, sub: 'Premiums collected', icon: TrendingUp, color: 'var(--accent-gold)' },
    { label: 'Zones Flagged', value: adminData.zonesFlagged || '0', sub: 'Active risk monitors', icon: AlertTriangle, color: 'var(--accent-purple)' },
  ];

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '80px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Admin Command Centre</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time platform metrics • Updated live
          </p>
        </div>
        {error && (
          <Badge variant="amber" style={{ fontSize: '12px' }}>API in dev mode — partial data</Badge>
        )}
      </header>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {kpiCards.map((kpi, i) => (
          <Card key={i} glow={i === 0}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{kpi.label}</div>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${kpi.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{kpi.sub}</div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Claims Trend */}
        <Card>
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Claims Trend (Weekly)</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminAnalytics.claimsTrend || []}>
                <defs>
                  <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="filed" stroke="var(--accent-cyan)" fill="url(#colorFiled)" strokeWidth={2} name="Filed" />
                <Area type="monotone" dataKey="approved" stroke="var(--accent-green)" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Approved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fraud Breakdown Pie */}
        <Card>
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Fraud by Type</h3>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={adminAnalytics.fraudStatsByType || []} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {(adminAnalytics.fraudStatsByType || []).map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(adminAnalytics.fraudStatsByType || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* City Distribution */}
      {adminData.cityDistribution?.length > 0 && (
        <Card style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>City Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {adminData.cityDistribution.map((city, i) => (
              <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{city.city}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{city.users} users · {city.claims} claims</div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                  <div style={{ width: `${Math.min((city.users / (adminData.totalUsers || 1)) * 100, 100)}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {adminAnalytics.recentActivity?.length > 0 && (
        <Card>
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Recent Payouts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {adminAnalytics.recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{a.user} — {a.city}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>₹{a.amount}</div>
                  <Badge variant="green" style={{ fontSize: '10px' }}>{a.status?.toUpperCase()}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
