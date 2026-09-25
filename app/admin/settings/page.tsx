'use client';

import React, { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Database, CloudUpload, RefreshCw } from 'lucide-react';
import { SiteSettings } from '@/types/portfolio';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettingsAndStatus();
  }, []);

  const fetchSettingsAndStatus = async () => {
    try {
      setLoading(true);
      const [settingsRes, syncRes] = await Promise.all([
        fetch('/api/data/settings'),
        fetch('/api/sync'),
      ]);
      const sData = await settingsRes.json();
      const statusData = await syncRes.json();

      if (sData.settings) setSettings(sData.settings);
      setDbStatus(statusData);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: settings }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Settings saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToSupabase = async () => {
    if (!confirm('This will synchronize and push all current portfolio items and settings to your Supabase tables. Proceed?')) {
      return;
    }

    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Sync failed');
      setMessage({ type: 'success', text: result.message || 'Synchronized to Supabase successfully!' });
      await fetchSettingsAndStatus();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error syncing to Supabase' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !settings) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading site settings...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="admin-header-title">Site Settings &amp; Supabase Integration</h1>
        <p className="admin-header-sub">
          Configure SEO tags, audio easter eggs, footer info, and link your Supabase database.
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

      {/* Supabase Connection & Cloud Sync Card */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: dbStatus?.connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={24} color={dbStatus?.connected ? '#10b981' : '#f59e0b'} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Supabase Cloud Database
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                Status: {dbStatus?.message || 'Checking status...'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={fetchSettingsAndStatus}
              className="admin-btn admin-btn-secondary"
            >
              <RefreshCw size={15} /> Check Status
            </button>
            <button
              type="button"
              onClick={handleSyncToSupabase}
              className="admin-btn admin-btn-primary"
              disabled={syncing || !dbStatus?.configured}
              title={!dbStatus?.configured ? 'Configure Supabase in .env.local first' : 'Push all current data to Supabase'}
            >
              <CloudUpload size={16} />
              <span>{syncing ? 'Syncing...' : 'Sync All Data to Supabase'}</span>
            </button>
          </div>
        </div>

        <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dbStatus?.connected ? '#10b981' : '#f59e0b',
            }}></span>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
              {dbStatus?.connected ? 'Live Supabase Connection Established' : 'Awaiting Supabase Connection'}
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
            Manage database connectivity and synchronize portfolio data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* SEO & Meta Tags */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Search Engine Optimization (SEO) &amp; OpenGraph
          </h2>

          <div className="admin-form-group">
            <label className="admin-label">Page Title Tag *</label>
            <input
              type="text"
              className="admin-input"
              value={settings.metaTitle}
              onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Meta Description *</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={settings.metaDescription}
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Meta Keywords (Comma-separated)</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={settings.metaKeywords}
              onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
            />
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">OpenGraph Social Share Image URL</label>
              <input
                type="text"
                className="admin-input"
                value={settings.ogImage}
                onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Browser Favicon URL</label>
              <input
                type="text"
                className="admin-input"
                value={settings.favicon}
                onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Audio Easter Egg & Interactivity */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Audio Easter Egg &amp; Micro-Interactions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                id="enableAudio"
                checked={settings.enableAudioEasterEgg}
                onChange={(e) => setSettings({ ...settings, enableAudioEasterEgg: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
              />
              <label htmlFor="enableAudio" style={{ color: '#cbd5e1', fontSize: '0.95rem', cursor: 'pointer' }}>
                Enable Mobile Device Shake Audio (&ldquo;Shake to cure bore&rdquo;)
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <input
                type="checkbox"
                id="attentionBlink"
                checked={settings.attentionTitleBlink}
                onChange={(e) => setSettings({ ...settings, attentionTitleBlink: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
              />
              <label htmlFor="attentionBlink" style={{ color: '#cbd5e1', fontSize: '0.95rem', cursor: 'pointer' }}>
                Enable Tab Visibility Title Rotation (when user switches tabs)
              </label>
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Mobile Shake Audio File Source</label>
              <input
                type="text"
                className="admin-input"
                value={settings.mobileAudioSrc}
                onChange={(e) => setSettings({ ...settings, mobileAudioSrc: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Desktop Audio File Source</label>
              <input
                type="text"
                className="admin-input"
                value={settings.desktopAudioSrc}
                onChange={(e) => setSettings({ ...settings, desktopAudioSrc: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Footer Configuration */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1.5rem' }}>
            Footer &amp; Copyright Details
          </h2>

          <div className="admin-grid-2">
            <div className="admin-form-group">
              <label className="admin-label">Footer Owner Name</label>
              <input
                type="text"
                className="admin-input"
                value={settings.footerOwner}
                onChange={(e) => setSettings({ ...settings, footerOwner: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Footer Tagline</label>
              <input
                type="text"
                className="admin-input"
                value={settings.footerTagline}
                onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Footer Collaboration Subtext</label>
            <input
              type="text"
              className="admin-input"
              value={settings.footerSubtext}
              onChange={(e) => setSettings({ ...settings, footerSubtext: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Version / Last Updated Text</label>
            <input
              type="text"
              className="admin-input"
              value={settings.lastUpdatedText}
              onChange={(e) => setSettings({ ...settings, lastUpdatedText: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="admin-btn admin-btn-primary" style={{ padding: '0.85rem 2rem' }} disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
