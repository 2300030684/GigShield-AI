import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { AlertTriangle, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import api from '../services/api.js';

const FraudMonitor = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.getFraudCases(filter !== 'all' ? filter : undefined);
      setCases(res.cases || []);
    } catch (err) {
      console.error('Fraud cases error:', err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (caseId, action) => {
    setActionLoading(caseId + action);
    try {
      await api.updateFraudCase(caseId, action);
      setCases(prev => prev.map(c =>
        (c._id === caseId || c.id === caseId)
          ? { ...c, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'review' }
          : c
      ));
      setSelectedCase(null);
    } catch (err) {
      console.error('Fraud action error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'var(--accent-red)';
    if (score >= 45) return 'var(--accent-orange)';
    return 'var(--accent-green)';
  };

  const getRiskLabel = (score) => score >= 70 ? 'HIGH' : score >= 45 ? 'MEDIUM' : 'LOW';
  const getRiskVariant = (score) => score >= 70 ? 'red' : score >= 45 ? 'amber' : 'green';

  const filtered = filter === 'all' ? cases : cases.filter(c => c.status === filter);
  const stats = {
    total: cases.length,
    high: cases.filter(c => (c.score || 0) >= 70).length,
    pending: cases.filter(c => c.status === 'pending').length,
    prevented: cases.filter(c => c.status === 'review' || c.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '24px', color: 'var(--text-secondary)' }}>
        <Loader2 size={48} className="animate-spin" style={{ opacity: 0.5 }} />
        <p>Loading Fraud Monitor...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🚨 Fraud Monitor</h1>
        <p style={{ color: 'var(--text-secondary)' }}>AI-flagged suspicious claims — real-time detection</p>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Flagged', value: stats.total, color: 'var(--accent-cyan)' },
          { label: 'High Risk', value: stats.high, color: 'var(--accent-red)' },
          { label: 'Pending Review', value: stats.pending, color: 'var(--accent-orange)' },
          { label: 'Resolved', value: stats.prevented, color: 'var(--accent-green)' },
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'pending', 'review', 'rejected', 'approved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'var(--font-body)',
              background: filter === f ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
              color: filter === f ? '#000' : 'var(--text-secondary)',
              border: filter === f ? 'none' : '1px solid var(--border)',
              fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCase ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Cases list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '48px' }}>
              <CheckCircle size={48} color="var(--accent-green)" style={{ margin: '0 auto 16px' }} />
              <h3>No cases in this category</h3>
              <p style={{ color: 'var(--text-muted)' }}>All {filter} cases have been processed</p>
            </Card>
          )}
          {filtered.map((fraudCase, idx) => {
            const score = fraudCase.score || 0;
            return (
              <Card
                key={idx}
                hover
                style={{
                  cursor: 'pointer',
                  border: selectedCase?._id === fraudCase._id ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
                  borderLeft: `4px solid ${getRiskColor(score)}`,
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedCase(fraudCase)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '16px' }}>{fraudCase.name}</span>
                      <Badge variant={getRiskVariant(score)} style={{ fontSize: '10px' }}>{getRiskLabel(score)} RISK</Badge>
                      {fraudCase.status !== 'pending' && (
                        <Badge variant={fraudCase.status === 'approved' ? 'green' : 'red'} style={{ fontSize: '10px' }}>
                          {fraudCase.status.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {fraudCase.city} · Claim #{fraudCase.id} · {fraudCase.date}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: getRiskColor(score) }}>
                      {score}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>FRAUD SCORE</div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--accent-red)', fontWeight: 600 }}>
                    🚩 {fraudCase.flag || fraudCase.issue}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fraudCase.type}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>₹{fraudCase.claimAmount || fraudCase.amount || 0}</span>
                  </div>
                  {fraudCase.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        style={{ padding: '6px 14px', fontSize: '12px', borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}
                        onClick={() => handleAction(fraudCase._id || fraudCase.id, 'approve')}
                        disabled={actionLoading === (fraudCase._id || fraudCase.id) + 'approve'}
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        variant="outline"
                        style={{ padding: '6px 14px', fontSize: '12px', borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                        onClick={() => handleAction(fraudCase._id || fraudCase.id, 'reject')}
                        disabled={actionLoading === (fraudCase._id || fraudCase.id) + 'reject'}
                      >
                        ✗ Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedCase && (
          <Card glow style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px' }}>Case Details</h3>
              <button onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {[
                ['User', selectedCase.name],
                ['City', selectedCase.city],
                ['Claim ID', `#${selectedCase.id}`],
                ['Amount', `₹${selectedCase.claimAmount || selectedCase.amount || 0}`],
                ['Date', `${selectedCase.date} ${selectedCase.time || ''}`],
                ['Event Type', selectedCase.type],
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,77,106,0.06)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '8px' }}>🤖 AI Verdict</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedCase.aiVerdict}</p>
            </div>

            {selectedCase.findings && selectedCase.findings.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>FINDINGS</div>
                {selectedCase.findings.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: f.severity === 'high' ? 'var(--accent-red)' : 'var(--accent-green)', flexShrink: 0 }}>
                      {f.severity === 'high' ? '⚠️' : '✅'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f.text}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedCase.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="outline"
                  icon={<CheckCircle size={16} />}
                  style={{ flex: 1, borderColor: 'var(--accent-green)', color: 'var(--accent-green)' }}
                  onClick={() => handleAction(selectedCase._id || selectedCase.id, 'approve')}
                  disabled={!!actionLoading}
                >
                  Approve Payout
                </Button>
                <Button
                  variant="outline"
                  icon={<XCircle size={16} />}
                  style={{ flex: 1, borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}
                  onClick={() => handleAction(selectedCase._id || selectedCase.id, 'reject')}
                  disabled={!!actionLoading}
                >
                  Reject Claim
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default FraudMonitor;
