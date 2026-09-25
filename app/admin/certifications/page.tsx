'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Award, Save, AlertCircle, Eye } from 'lucide-react';
import { CertificationItem } from '@/types/portfolio';

export default function AdminCertificationsPage() {
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CertificationItem, 'id'>>({
    title: '',
    imageUrl: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/certifications');
      const data = await res.json();
      if (data.certifications) setCertifications(data.certifications);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load certifications.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      imageUrl: '',
      issuer: '',
      issueDate: '',
      credentialUrl: '',
      order_index: certifications.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: CertificationItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      imageUrl: item.imageUrl,
      issuer: item.issuer || '',
      issueDate: item.issueDate || '',
      credentialUrl: item.credentialUrl || '',
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    const updated = certifications.filter((c) => c.id !== id);
    setCertifications(updated);
    await saveToBackend(updated);
  };

  const handleToggleActive = async (id: string) => {
    const updated = certifications.map((c) =>
      c.id === id ? { ...c, is_active: !c.is_active } : c
    );
    setCertifications(updated);
    await saveToBackend(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: CertificationItem[];

    if (editingId) {
      updated = certifications.map((item) =>
        item.id === editingId ? { ...formData, id: editingId } : item
      );
    } else {
      const newItem: CertificationItem = {
        ...formData,
        id: `cert-${Date.now()}`,
      };
      updated = [...certifications, newItem];
    }

    updated.sort((a, b) => a.order_index - b.order_index);
    setCertifications(updated);
    setIsModalOpen(false);
    await saveToBackend(updated);
  };

  const saveToBackend = async (data: CertificationItem[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Certificates updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving certificates' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-header-title">Certifications &amp; Awards</h1>
          <p className="admin-header-sub">
            Add new certificates, upload badges, and manage the interactive lightbox gallery.
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          <span>Add New Certificate</span>
        </button>
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

      {loading ? (
        <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading certificates...</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {certifications.map((item) => (
            <div key={item.id} className="admin-card" style={{ padding: '1.25rem', marginBottom: 0 }}>
              <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', background: '#0f172a' }}>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  #{item.order_index}
                </span>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem', minHeight: '2.4rem' }}>
                {item.title}
              </h3>
              {item.issuer && (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Issuer: {item.issuer}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => handleToggleActive(item.id)}
                  className={`admin-badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {item.is_active ? 'Visible' : 'Hidden'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(item)} className="admin-btn admin-btn-secondary" style={{ padding: '0.35rem 0.65rem' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="admin-btn admin-btn-danger" style={{ padding: '0.35rem 0.65rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                {editingId ? 'Edit Certificate' : 'Add New Certificate'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Certificate Title *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. TryHackMe Cybersecurity Certificate"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Image Path / URL *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. /src/cert-05-tryhackme.jpg or https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Issuer / Organization</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. TryHackMe, Udemy, CFC"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Display Order Index</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Credential Verification URL (Optional)</label>
                <input
                  type="url"
                  className="admin-input"
                  placeholder="https://..."
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="certActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <label htmlFor="certActive" style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Visible on Live Portfolio
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Certificate' : 'Add Certificate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
