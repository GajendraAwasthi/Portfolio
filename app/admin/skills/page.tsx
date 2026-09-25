'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Wrench, Save, AlertCircle } from 'lucide-react';
import { SkillItem } from '@/types/portfolio';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<SkillItem, 'id'>>({
    name: '',
    percentage: 80,
    category: 'Programming',
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/skills');
      const data = await res.json();
      if (data.skills) setSkills(data.skills);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load skills.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      percentage: 85,
      category: 'Programming',
      order_index: skills.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: SkillItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      percentage: item.percentage,
      category: item.category,
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;
    const updated = skills.filter((s) => s.id !== id);
    setSkills(updated);
    await saveToBackend(updated);
  };

  const handleToggleActive = async (id: string) => {
    const updated = skills.map((s) =>
      s.id === id ? { ...s, is_active: !s.is_active } : s
    );
    setSkills(updated);
    await saveToBackend(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: SkillItem[];

    if (editingId) {
      updated = skills.map((item) =>
        item.id === editingId ? { ...formData, id: editingId } : item
      );
    } else {
      const newItem: SkillItem = {
        ...formData,
        id: `sk-${Date.now()}`,
      };
      updated = [...skills, newItem];
    }

    updated.sort((a, b) => a.order_index - b.order_index);
    setSkills(updated);
    setIsModalOpen(false);
    await saveToBackend(updated);
  };

  const saveToBackend = async (data: SkillItem[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Skills updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving skills' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-header-title">Skills &amp; Expertise</h1>
          <p className="admin-header-sub">
            Add skills, assign proficiency percentages, and group them into custom categories.
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          <span>Add New Skill</span>
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
        <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading skills...</div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Skill Name</th>
                <th>Category</th>
                <th>Proficiency</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: '#94a3b8', fontWeight: 600 }}>#{item.order_index}</td>
                  <td style={{ fontWeight: 700, color: '#f8fafc' }}>{item.name}</td>
                  <td>
                    <span className="admin-badge badge-info">{item.category}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '8px', background: '#334155', borderRadius: '999px', overflow: 'hidden', minWidth: '80px' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', background: '#3b82f6' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: '0.85rem' }}>{item.percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`admin-badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {item.is_active ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(item)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.4rem 0.75rem' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '0.4rem 0.75rem' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              maxWidth: '520px',
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
                {editingId ? 'Edit Skill' : 'Add New Skill'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Skill Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Next.js / TypeScript"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Category *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Programming, Design Tools, Soft Skills"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Order Index</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="admin-label" style={{ margin: 0 }}>Proficiency Percentage: {formData.percentage}%</label>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#3b82f6' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="skActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <label htmlFor="skActive" style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Visible on Live Portfolio
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Skill' : 'Add Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
