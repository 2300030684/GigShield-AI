import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/Card';
import { UserPlus, Shield, CloudRain, Wallet } from 'lucide-react';
import Footer from '../components/Footer';

const HowItWorksPage = () => {
  const steps = [
    {
      number: '01',
      icon: UserPlus,
      title: 'Sign up in 2 minutes',
      description: 'Create your account with basic details: name, phone, delivery zone, and platform. Choose a coverage plan that fits your needs. No complex forms or documentation required.'
    },
    {
      number: '02',
      icon: Shield,
      title: 'Your coverage starts immediately',
      description: 'Pay your first weekly premium securely through Razorpay. Coverage activates within minutes. You\'re protected from day one against rain, heat, pollution, strikes, and curfews.'
    },
    {
      number: '03',
      icon: CloudRain,
      title: 'Disruption detected automatically',
      description: 'Our AI monitors weather patterns, traffic data, and platform downtimes in real-time. When disruption thresholds are met, your claim is automatically verified without any action needed from you.'
    },
    {
      number: '04',
      icon: Wallet,
      title: 'Get paid instantly',
      description: 'Once verification is complete, compensation is transferred directly to your bank account. Most payouts arrive within 1-2 hours. Track everything in your dashboard.'
    }
  ];

  return (
    <div className="how-it-works-container" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <section style={{ padding: '160px 5% 80px', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 style={{ fontSize: '64px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Protection in four simple steps
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
              From signup to payout, everything is automated and transparent. Here's exactly how Trustpay works.
            </p>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: '80px 5%' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover style={{ overflow: 'hidden', padding: '32px' }}>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      flexShrink: 0, width: '64px', height: '64px', borderRadius: '16px', 
                      background: 'linear-gradient(135deg, var(--accent-cyan), #4C1D95)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                      <step.icon size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px', textTransform: 'uppercase' }}>Step {step.number}</div>
                      <h3 style={{ fontSize: '28px', marginBottom: '12px', color: 'var(--text-primary)' }}>{step.title}</h3>
                      <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 5%', background: 'var(--accent-cyan-dim)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
             initial={{ opacity: 0, scale: 0.98 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5 }}
             viewport={{ once: true }}
          >
            <Card glow style={{ padding: '48px', maxWidth: '900px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '24px', color: 'var(--text-primary)' }}>Real-time verification process</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '40px' }}>
                When disruption occurs, our system cross-references multiple data sources: meteorological reports, traffic sensors, platform API data, and historical patterns. This multi-layered verification happens in seconds, not days.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '8px' }}>47 sec</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average verification time</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '8px' }}>1.8 hrs</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average payout time</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '8px' }}>96.4%</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Auto-approval rate</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
