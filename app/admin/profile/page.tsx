'use client';

import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Check, AlertCircle, User } from 'lucide-react';
import { ProfileHero } from '@/types/portfolio';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<ProfileHero | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newPhrase, setNewPhrase] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/profile');
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhrase = () => {
    if (!newPhrase.trim() || !profile) return;
    setProfile({
      ...profile,
      headlineTyping: [...(profile.headlineTyping || []), newPhrase.trim()],
    });
    setNewPhrase('');
  };

  const handleRemovePhrase = (index: number) => {
    if (!profile) return;
    const updated = profile.headlineTyping.filter((_, i) => i !== index);
    setProfile({ ...profile, headlineTyping: updated });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: profile }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Profile saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading profile settings...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-header-title">Profile &amp; Hero Settings</h1>
        <p className="admin-header-sub">
          Customize your name, hero photo, typing animations, bio, resume URL, and social media accounts.
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

      <form onSubmit={handleSave}>
        {/* Basic Info */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Hero Branding &amp; Personal Info
          </h2>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">First / Given Name *</label>
              <input
                type="text"
                className="admin-input"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Surname / Highlight (Gradient Effect) *</label>
              <input
                type="text"
                className="admin-input"
                value={profile.surnameGradient}
                onChange={(e) => setProfile({ ...profile, surnameGradient: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Avatar / Profile Image URL *</label>
              <input
                type="text"
                className="admin-input"
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                required
              />
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Tip: Use a direct HTTPS image URL or a path like /src/your-photo.jpg
              </span>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Resume / CV Document URL</label>
              <input
                type="text"
                className="admin-input"
                value={profile.resumeUrl}
                onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Main Bio / Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            />
          </div>
        </div>

        {/* Typing Animation Phrases */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
            Animated Typing Phrases
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            These tags continuously type and erase under your name in the hero section.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {profile.headlineTyping?.map((phrase, idx) => (
              <div
                key={idx}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#60a5fa',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                <span>{phrase}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePhrase(idx)}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '500px' }}>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g. Cybersecurity Visionary"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhrase())}
            />
            <button
              type="button"
              onClick={handleAddPhrase}
              className="admin-btn admin-btn-secondary"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Social Profiles &amp; Contact Info
          </h2>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Contact / Inquiry Email</label>
              <input
                type="email"
                className="admin-input"
                value={profile.contactEmail || ''}
                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">LinkedIn Profile URL</label>
              <input
                type="url"
                className="admin-input"
                value={profile.socialLinks?.linkedin || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, linkedin: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">GitHub Profile URL</label>
              <input
                type="url"
                className="admin-input"
                value={profile.socialLinks?.github || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, github: e.target.value },
                  })
                }
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">TryHackMe Profile URL</label>
              <input
                type="url"
                className="admin-input"
                value={profile.socialLinks?.tryhackme || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, tryhackme: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Facebook Profile URL</label>
              <input
                type="url"
                className="admin-input"
                value={profile.socialLinks?.facebook || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, facebook: e.target.value },
                  })
                }
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Twitter / X Profile URL</label>
              <input
                type="url"
                className="admin-input"
                value={profile.socialLinks?.twitter || ''}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, twitter: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '0.85rem 2rem' }} disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
