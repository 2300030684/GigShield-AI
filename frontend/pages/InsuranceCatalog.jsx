import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Shield, Umbrella, Heart, Car, CheckCircle, Info, Sparkles } from 'lucide-react';
import api from '../services/api.js';

const InsuranceCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getInsuranceProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch insurance products:', err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'CloudRain': return <Umbrella size={32} color="var(--accent-cyan)" />;
      case 'Navigation': return <Car size={32} color="var(--accent-orange)" />;
      case 'Heart': return <Heart size={32} color="var(--accent-red)" />;
      default: return <Shield size={32} color="var(--accent-green)" />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}>
          <Sparkles size={16} /> FOR INSURERS & PARTNERS
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '20px', letterSpacing: '-1px' }}>
          Our Product <span className="text-gradient">Catalog</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
          Discover specialized insurance products designed for the modern mobile workforce. Powered by AI risk assessment and instant payouts.
        </p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
          {products.map(product => (
            <Card key={product.id} glow style={{ padding: '40px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
                <Badge variant="cyan">{product.category}</Badge>
              </div>
              
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                {getIcon(product.iconName)}
              </div>

              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6, flex: 1 }}>{product.description}</p>
              
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Monthly Premium</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 800 }}>₹{product.monthlyPremium}</span>
                  <span style={{ color: 'var(--text-muted)' }}>/ month</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={16} color="var(--accent-green)" />
                  <span>Coverage up to ₹{product.coverageAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={16} color="var(--accent-green)" />
                  <span>AI-Driven Claims Processing</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="primary" style={{ flex: 1 }}>Apply Now</Button>
                <Button variant="ghost" style={{ width: '48px', padding: 0 }}><Info size={20} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Partnership Section */}
      <section style={{ marginTop: '100px', textAlign: 'center' }}>
        <Card glow style={{ padding: '60px', background: 'var(--bg-card-hover)' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>Ready to Partner with Trustpay?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Integrate our real-time risk intelligence into your existing insurance platform or create new products with us.
          </p>
          <Button variant="primary" glow size="large">Contact Partnership Team</Button>
        </Card>
      </section>
    </div>
  );
};

export default InsuranceCatalog;
