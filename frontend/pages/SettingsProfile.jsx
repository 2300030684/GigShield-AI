import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { fetchUserData, updateUserSettings } from '../services/api.js';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { User, Smartphone, Shield, Bell, CreditCard, ChevronDown, ChevronRight, LogOut, CheckCircle, MapPin, Loader2 } from 'lucide-react';

const SettingsProfile = () => {
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserData();
        setUser(data);
        setFormData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserSettings(user.id, formData);
      const updatedUser = await fetchUserData();
      setUser(updatedUser);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>Retrieving Profile Settings...</p>
          {!user && !loading && <span style={{ color: 'var(--accent-red)', marginTop: '8px', display: 'block' }}>Profile data unavailable (Server Error)</span>}
        </div>
        {!user && !loading && <Button onClick={() => window.location.reload()}>Retry Load</Button>}
      </div>
    );
  }

  const sections = [
    { title: 'Personal Information', icon: User, content: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
         <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Full Name</label>
            <input type="text" name="name" className="input-field" value={formData.name || ''} onChange={handleInputChange} />
         </div>
         <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Phone Number</label>
            <input type="text" name="phone" className="input-field" value={formData.phone || ''} onChange={handleInputChange} />
         </div>
         <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Email Address</label>
            <input type="email" name="email" className="input-field" value={formData.email || ''} onChange={handleInputChange} />
         </div>
         <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>City</label>
            <input type="text" name="city" className="input-field" value={formData.city || ''} onChange={handleInputChange} />
         </div>
         <div style={{ gridColumn: 'span 2', background: 'var(--accent-cyan-dim)', padding: '16px', borderRadius: '8px', border: '1px solid var(--accent-cyan-dim)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle color="var(--accent-green)" size={20} />
            <span style={{ fontSize: '14px' }}>Aadhaar identity verified on 12 Feb 2025</span>
         </div>
      </div>
    )},
    { title: 'Platform Settings', icon: Smartphone, content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
               <div style={{ width: 48, height: 48, background: '#FF8C42', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', color: 'white' }}>S</div>
               <div>
                  <div style={{ fontWeight: 600 }}>{user.platform || 'Swiggy'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Primary Connected Platform</div>
               </div>
            </div>
            <Badge variant="cyan">Connected</Badge>
         </div>
         <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Vehicle Type</label>
            <div style={{ display: 'flex', gap: '12px' }}>
               <div style={{ padding: '12px 24px', background: 'var(--accent-cyan-dim)', border: '1px solid rgba(37,99,235,0.2)', color: 'var(--accent-cyan)', borderRadius: '8px', fontWeight: 600 }}>{user.vehicleType || user.vehicle || '2-Wheeler'}</div>
               <div style={{ padding: '12px 24px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', opacity: 0.5 }}>Alternative</div>
            </div>
         </div>
      </div>
    )},
    { title: 'Payment Settings', icon: CreditCard, content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
         <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Primary UPI ID</label>
            <div style={{ display: 'flex', gap: '12px' }}>
               <input type="text" name="upiId" className="input-field" value={formData.upiID || formData.upiId || ''} onChange={handleInputChange} />
               <Badge variant="green" style={{ height: 'fit-content', alignSelf: 'center' }}>Verified</Badge>
            </div>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <div style={{ fontSize: '14px' }}>Payout preference</div>
            <select style={{ background: 'transparent', color: 'var(--text-primary)', border: 'none', fontWeight: 600, outline: 'none' }}>
               <option>Instant Payout</option>
               <option>Weekly Batch</option>
            </select>
         </div>
      </div>
    )},
    { title: 'Notifications', icon: Bell, content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
         {[
           { label: 'Push Notifications', checked: true },
           { label: 'Claim Alerts', checked: true },
           { label: 'Risk Warnings', checked: true },
           { label: 'Weekly Earnings Summary', checked: true },
           { label: 'Promotional Messages', checked: false },
         ].map((item, idx) => (
           <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
              <div style={{ 
                width: '44px', height: '24px', borderRadius: '12px', padding: '2px',
                background: item.checked ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                cursor: 'pointer', display: 'flex', transition: 'all 0.3s ease',
                justifyContent: item.checked ? 'flex-end' : 'flex-start'
              }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white' }}></div>
              </div>
           </div>
         ))}
      </div>
    )},
    { title: 'Policy Settings', icon: Shield, content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <div style={{ fontWeight: 600 }}>Auto-renewal</div>
               <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automatically renew your plan every Monday</div>
            </div>
            <Badge variant={formData.coveragePaused ? "red" : "green"}>{formData.coveragePaused ? "OFF" : "ON"}</Badge>
         </div>
         <Button 
           variant="outline" 
           onClick={() => setFormData({ ...formData, coveragePaused: !formData.coveragePaused })}
           style={{ 
             width: '100%', 
             borderColor: formData.coveragePaused ? 'var(--accent-green)' : 'var(--accent-orange)', 
             color: formData.coveragePaused ? 'var(--accent-green)' : 'var(--accent-orange)' 
           }}
         >
           {formData.coveragePaused ? 'Resume Coverage' : 'Pause Coverage'}
         </Button>
      </div>
    )},
  ];

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Profile & Settings</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent-cyan), #0077FF)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', fontWeight: 800, margin: '0 auto 24px',
                boxShadow: '0 0 20px rgba(0, 224, 255, 0.4)'
              }}>
                {(user.name || 'TP').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{user.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                <MapPin size={16} /> {user.city}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0', marginBottom: '24px' }}>
                 <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Member Since</div>
                    <div style={{ fontWeight: 600 }}>{user.memberSince || 'Feb 2025'}</div>
                 </div>
                 <div style={{ width: '1px', background: 'var(--border)' }}></div>
                 <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Days</div>
                    <div style={{ fontWeight: 600 }}>{user.activeDays || 134}</div>
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Protection Score</span>
                    <Badge variant="cyan">{user.protectionScore || 76}/100</Badge>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Earnings Protected</span>
                    <span style={{ fontWeight: 600 }}>₹{(user.earningsProtectedTotal || 6840).toLocaleString()}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Claims Paid</span>
                    <span style={{ fontWeight: 600 }}>{user.totalClaims || 8} (₹{(user.totalPaid || 2481).toLocaleString()})</span>
                 </div>
              </div>

              <Button variant="ghost" icon={<LogOut size={16} />} onClick={handleLogout} style={{ width: '100%', marginTop: '40px', color: 'var(--accent-red)', borderColor: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                 Log Out
              </Button>
           </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {sections.map((section, idx) => (
             <Card 
               key={idx} 
               hover={false} 
               style={{ 
                 padding: 0, 
                 overflow: 'hidden', 
                 border: activeAccordion === idx ? '1px solid var(--accent-cyan)' : '1px solid var(--border)' 
               }}
             >
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                  style={{
                    width: '100%', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer',
                    fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600
                  }}
                >
                   <section.icon size={20} color={activeAccordion === idx ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                   <span style={{ flex: 1, textAlign: 'left' }}>{section.title}</span>
                   {activeAccordion === idx ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {activeAccordion === idx && (
                  <div className="animate-fade-in-up" style={{ padding: '0 24px 32px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
                    {section.content}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                       <Button variant="primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 32px' }}>
                         {saving ? 'Saving...' : 'Save Changes'}
                       </Button>
                    </div>
                  </div>
                )}
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsProfile;
