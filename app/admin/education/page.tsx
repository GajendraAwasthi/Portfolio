'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, GraduationCap, Save, AlertCircle } from 'lucide-react';
import { EducationItem } from '@/types/portfolio';

export default function AdminEducationPage() {
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State for creating/editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<EducationItem, 'id'>>({
    degree: '',
    institution: '',
    timeline: '',
    stream: '',
    description: '',
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/education');
      const data = await res.json();
      if (data.education) {
        setEducation(data.education);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to load education data.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      degree: '',
      institution: '',
      timeline: '',
      stream: '',
      description: '',
      order_index: education.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: EducationItem) => {
    setEditingId(item.id);
    setFormData({
      degree: item.degree,
      institution: item.institution,
      timeline: item.timeline,
      stream: item.stream || '',
      description: item.description,
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    const updated = education.filter((e) => e.id !== id);
    setEducation(updated);
    await saveToBackend(updated);
  };

  const handleToggleActive = async (id: string) => {
    const updated = education.map((e) =>
      e.id === id ? { ...e, is_active: !e.is_active } : e
    );
    setEducation(updated);
    await saveToBackend(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: EducationItem[];

    if (editingId) {
      updated = education.map((item) =>
        item.id === editingId ? { ...formData, id: editingId } : item
      );
    } else {
      const newItem: EducationItem = {
        ...formData,
        id: `edu-${Date.now()}`,
      };
      updated = [...education, newItem];
    }

    updated.sort((a, b) => a.order_index - b.order_index);
    setEducation(updated);
    setIsModalOpen(false);
    await saveToBackend(updated);
  };

  const saveToBackend = async (data: EducationItem[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Education updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving education' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-header-title">Education Management</h1>
          <p className="admin-header-sub">
            Add new academic qualifications, edit degrees, and reorder the timeline.
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          <span>Add New Education</span>
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
        <div style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>Loading education records...</div>
      ) : education.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <GraduationCap size={48} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>No Education Records Yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Click &ldquo;Add New Education&rdquo; to add your degrees and academic history.
          </p>
          <button onClick={openAddModal} className="admin-btn admin-btn-primary">
            <Plus size={16} /> Add First Education
          </button>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Degree / Program</th>
                <th>Institution</th>
                <th>Timeline</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {education.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: '#94a3b8', fontWeight: 600 }}>#{item.order_index}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{item.degree}</div>
                    {item.stream && (
                      <span style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
                        Stream: {item.stream}
                      </span>
                    )}
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{item.institution}</td>
                  <td>
                    <span className="admin-badge badge-warning">{item.timeline}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`admin-badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle visibility"
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
                        title="Edit record"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '0.4rem 0.75rem' }}
                        title="Delete record"
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
              maxWidth: '600px',
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
                {editingId ? 'Edit Education Record' : 'Add New Education Record'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Degree / Level *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Bachelor of Computer Applications"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  required
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Institution / University *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. NAST COLLEGE, Pokhara University"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Timeline / Years *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. 2024 - Present"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Stream / Specialization (Optional)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Management + Computer Science"
                    value={formData.stream}
                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
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
                <label className="admin-label">Description / Achievements</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  placeholder="Brief summary of coursework, cybersecurity focus, academic performance, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="eduActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <label htmlFor="eduActive" style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Visible on Live Portfolio
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Record' : 'Add Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
