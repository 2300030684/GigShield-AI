import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Shield, CloudRain, TrendingUp, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page-container" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* HERO SECTION */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img 
            src="https://images.unsplash.com/photo-1695653422676-d9dd88400e21" 
            alt="Delivery worker"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.4) 100%)' }}></div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ maxWidth: '800px' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 style={{ fontSize: '72px', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
                Your safety net when <span style={{ color: 'var(--accent-cyan)' }}>weather</span> stops your work
              </h1>
              <p style={{ fontSize: '22px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '650px' }}>
                Instant payouts when rain, heat, or pollution disrupts your deliveries. No paperwork, no waiting. AI-powered income safety.
              </p>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <Link to="/register">
                  <Button variant="primary" glow style={{ padding: '16px 36px', fontSize: '18px' }}>
                    Register as worker <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" style={{ padding: '16px 36px', fontSize: '18px', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    See how it works
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section style={{ padding: '100px 5%', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '48px', marginBottom: '24px', color: 'var(--text-primary)' }}>The problem that started it all</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Delivery workers lose income during heavy rain, extreme heat, severe pollution, local strikes, and curfews. Traditional insurance is slow and complex. Trustpay changes that.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card style={{ height: '100%', border: 'none', background: 'var(--bg-primary)' }}>
                <div style={{ padding: '40px' }}>
                  <CloudRain size={48} color="var(--accent-red)" style={{ marginBottom: '24px' }} />
                  <h3 style={{ fontSize: '28px', marginBottom: '32px', color: 'var(--text-primary)' }}>Traditional coverage fails workers</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      'Weeks of waiting for claim approval',
                      'Complex documentation requirements',
                      'High rejection rates on valid claims',
                      'Income lost during processing'
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ 
                          width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)', fontWeight: 800
                        }}>×</div>
                        <p style={{ color: 'var(--text-muted)' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card glow style={{ height: '100%', borderColor: 'var(--accent-cyan-dim)' }}>
                <div style={{ padding: '40px' }}>
                  <Shield size={48} color="var(--accent-cyan)" style={{ marginBottom: '24px' }} />
                  <h3 style={{ fontSize: '28px', marginBottom: '32px', color: 'var(--text-primary)' }}>Trustpay delivers instant protection</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[
                      'Automated payouts in under 2 hours',
                      'Zero paperwork with AI verification',
                      'Coverage starts from day one',
                      'Affordable weekly premiums'
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <CheckCircle size={24} color="var(--accent-green)" />
                        <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '120px 5%', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px' }}>
            <h2 style={{ fontSize: '48px', marginBottom: '24px', color: 'var(--text-primary)' }}>Built for real protection</h2>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
              Advanced technology meets simple coverage that actually works when you need it.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card hover style={{ padding: '40px', height: '100%' }}>
                <Zap size={40} color="var(--accent-cyan)" style={{ marginBottom: '24px' }} />
                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Instant verification</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  AI analyzes weather data, traffic patterns, and platform downtime to automatically verify claims without human review.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card hover style={{ padding: '40px', height: '100%' }}>
                <TrendingUp size={40} color="var(--accent-cyan)" style={{ marginBottom: '24px' }} />
                <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Parametric automation</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Coverage triggers automatically when disruption thresholds are met. No claim forms, no waiting for approval.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '100px 5%', background: 'linear-gradient(135deg, var(--accent-cyan) 0%, #1E40AF 100%)', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontSize: '48px', fontWeight: 800, marginBottom: '24px' }}>Ready to protect your income?</h2>
            <p style={{ fontSize: '22px', opacity: 0.9, marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Join thousands of delivery workers who trust Trustpay for reliable income protection.
            </p>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register">
                <Button variant="outline" style={{ background: 'white', color: 'var(--accent-cyan)', border: 'none', padding: '16px 40px', fontSize: '18px' }}>
                  Get started now
                </Button>
              </Link>
              <Link to="/plans">
                <Button variant="outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', padding: '16px 40px', fontSize: '18px' }}>
                  View pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
