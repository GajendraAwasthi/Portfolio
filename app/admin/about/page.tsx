'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Info, Save, AlertCircle } from 'lucide-react';
import { AboutCard, StatCounter } from '@/types/portfolio';

export default function AdminAboutStatsPage() {
  const [cards, setCards] = useState<AboutCard[]>([]);
  const [stats, setStats] = useState<StatCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Card modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardEditingId, setCardEditingId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<Omit<AboutCard, 'id'>>({
    icon: '🔐',
    title: '',
    description: '',
    order_index: 1,
    is_active: true,
  });

  // Stat modal
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [statEditingId, setStatEditingId] = useState<string | null>(null);
  const [statForm, setStatForm] = useState<Omit<StatCounter, 'id'>>({
    target_number: 10,
    suffix: '+',
    label: '',
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/all');
      const data = await res.json();
      if (data.aboutCards) setCards(data.aboutCards);
      if (data.stats) setStats(data.stats);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load about data.' });
    } finally {
      setLoading(false);
    }
  };

  // Card Handlers
  const handleSaveCards = async (updatedCards: AboutCard[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/data/aboutCards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedCards }),
      });
      const resJson = await res.json();
      setMessage({ type: 'success', text: resJson.message || 'About cards updated!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save about cards' });
    } finally {
      setSaving(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: AboutCard[];
    if (cardEditingId) {
      updated = cards.map((c) =>
        c.id === cardEditingId ? { ...cardForm, id: cardEditingId } : c
      );
    } else {
      updated = [...cards, { ...cardForm, id: `about-${Date.now()}` }];
    }
    updated.sort((a, b) => a.order_index - b.order_index);
    setCards(updated);
    setIsCardModalOpen(false);
    await handleSaveCards(updated);
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Delete this feature card?')) return;
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    await handleSaveCards(updated);
  };

  // Stat Handlers
  const handleSaveStats = async (updatedStats: StatCounter[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/data/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: updatedStats }),
      });
      const resJson = await res.json();
      setMessage({ type: 'success', text: resJson.message || 'Stats updated!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save stats' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: StatCounter[];
    if (statEditingId) {
      updated = stats.map((s) =>
        s.id === statEditingId ? { ...statForm, id: statEditingId } : s
      );
    } else {
      updated = [...stats, { ...statForm, id: `stat-${Date.now()}` }];
    }
    updated.sort((a, b) => a.order_index - b.order_index);
    setStats(updated);
    setIsStatModalOpen(false);
    await handleSaveStats(updated);
  };

  const deleteStat = async (id: string) => {
    if (!confirm('Delete this stat counter?')) return;
    const updated = stats.filter((s) => s.id !== id);
    setStats(updated);
    await handleSaveStats(updated);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-header-title">About Cards &amp; Counters</h1>
        <p className="admin-header-sub">
          Edit your core pillar cards (Cybersecurity, Developer, Designer) and animated counters.
        </p>
      </div>

      {message && (
        <div
          style={{
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: message.type === 'success' ? '#34d399' : '#f87171',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Section 1: About Feature Cards */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              About Feature Cards
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              3-column cards highlighting your main domains of expertise.
            </p>
          </div>
          <button
            onClick={() => {
              setCardEditingId(null);
              setCardForm({ icon: '⚡', title: '', description: '', order_index: cards.length + 1, is_active: true });
              setIsCardModalOpen(true);
            }}
            className="admin-btn admin-btn-primary"
          >
            <Plus size={16} /> Add Card
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {cards.map((c) => (
            <div key={c.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>{c.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' }}>{c.description}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setCardEditingId(c.id);
                    setCardForm({ icon: c.icon, title: c.title, description: c.description, order_index: c.order_index, is_active: c.is_active });
                    setIsCardModalOpen(true);
                  }}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: '0.35rem 0.65rem' }}
                >
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteCard(c.id)} className="admin-btn admin-btn-danger" style={{ padding: '0.35rem 0.65rem' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Animated Stat Counters */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Animated Metric Counters
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Numerical badges (e.g. 20+ Technical Skills, 60+ Projects Delivered, etc.).
            </p>
          </div>
          <button
            onClick={() => {
              setStatEditingId(null);
              setStatForm({ target_number: 10, suffix: '+', label: '', order_index: stats.length + 1, is_active: true });
              setIsStatModalOpen(true);
            }}
            className="admin-btn admin-btn-primary"
          >
            <Plus size={16} /> Add Counter
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {stats.map((s) => (
            <div key={s.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.25rem' }}>
                {s.target_number}{s.suffix}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
                {s.label}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setStatEditingId(s.id);
                    setStatForm({ target_number: s.target_number, suffix: s.suffix, label: s.label, order_index: s.order_index, is_active: s.is_active });
                    setIsStatModalOpen(true);
                  }}
                  className="admin-btn admin-btn-secondary"
                  style={{ padding: '0.35rem 0.65rem' }}
                >
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteStat(s.id)} className="admin-btn admin-btn-danger" style={{ padding: '0.35rem 0.65rem' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Modal */}
      {isCardModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setIsCardModalOpen(false)}>
          <div style={{ width: '100%', maxWidth: '500px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.5rem' }}>
              {cardEditingId ? 'Edit Feature Card' : 'Add Feature Card'}
            </h2>
            <form onSubmit={handleCardSubmit}>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Icon (Emoji) *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={cardForm.icon}
                    onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Order Index</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={cardForm.order_index}
                    onChange={(e) => setCardForm({ ...cardForm, order_index: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Title *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Cybersecurity Visionary"
                  value={cardForm.title}
                  onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Description *</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  value={cardForm.description}
                  onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsCardModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} /> Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stat Modal */}
      {isStatModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setIsStatModalOpen(false)}>
          <div style={{ width: '100%', maxWidth: '480px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.5rem' }}>
              {statEditingId ? 'Edit Metric Counter' : 'Add Metric Counter'}
            </h2>
            <form onSubmit={handleStatSubmit}>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Target Number *</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={statForm.target_number}
                    onChange={(e) => setStatForm({ ...statForm, target_number: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Suffix (e.g. + or %)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={statForm.suffix}
                    onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Label *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Technical Skills"
                  value={statForm.label}
                  onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsStatModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} /> Save Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
