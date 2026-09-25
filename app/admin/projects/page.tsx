'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, FolderGit2, Save, AlertCircle } from 'lucide-react';
import { ProjectItem } from '@/types/portfolio';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState<Omit<ProjectItem, 'id'>>({
    title: '',
    description: '',
    team: '',
    tags: [],
    githubUrl: '',
    liveUrl: '',
    imageUrl: '',
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load projects.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setTagInput('');
    setFormData({
      title: '',
      description: '',
      team: '',
      tags: [],
      githubUrl: '',
      liveUrl: '',
      imageUrl: '',
      order_index: projects.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ProjectItem) => {
    setEditingId(item.id);
    setTagInput((item.tags || []).join(', '));
    setFormData({
      title: item.title,
      description: item.description,
      team: item.team || '',
      tags: item.tags || [],
      githubUrl: item.githubUrl || '',
      liveUrl: item.liveUrl || '',
      imageUrl: item.imageUrl || '',
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    await saveToBackend(updated);
  };

  const handleToggleActive = async (id: string) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    setProjects(updated);
    await saveToBackend(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let updated: ProjectItem[];

    if (editingId) {
      updated = projects.map((item) =>
        item.id === editingId ? { ...formData, tags: parsedTags, id: editingId } : item
      );
    } else {
      const newItem: ProjectItem = {
        ...formData,
        tags: parsedTags,
        id: `proj-${Date.now()}`,
      };
      updated = [...projects, newItem];
    }

    updated.sort((a, b) => a.order_index - b.order_index);
    setProjects(updated);
    setIsModalOpen(false);
    await saveToBackend(updated);
  };

  const saveToBackend = async (data: ProjectItem[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Projects saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving projects' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-header-title">Projects Showcase</h1>
          <p className="admin-header-sub">
            Add featured projects, technical stacks, GitHub repositories, and live links.
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          <span>Add New Project</span>
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
        <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading projects...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {projects.map((item) => (
            <div key={item.id} className="admin-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{item.title}</h3>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>#{item.order_index}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {item.description}
                </p>
                {item.team && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    <strong>Team:</strong> {item.team}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {item.tags?.map((t) => (
                    <span key={t} className="tag" style={{ background: '#0f172a', border: '1px solid #334155', color: '#60a5fa' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleToggleActive(item.id)}
                  className={`admin-badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {item.is_active ? 'Visible' : 'Hidden'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(item)} className="admin-btn admin-btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="admin-btn admin-btn-danger" style={{ padding: '0.4rem 0.75rem' }}>
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
              maxWidth: '620px',
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
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Project Title *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. GRAB X AI"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <label className="admin-label">Description *</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  placeholder="Overview of features, architecture, and technology."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Team Members (Optional)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Gajendra Awasthi, Bibhu Shrestha"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Tags / Technologies (Comma-separated)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. C Programming, AI Integration, Next.js, Supabase"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
              </div>

              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://github.com/..."
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Live Demo URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://..."
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="projActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <label htmlFor="projActive" style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Visible on Live Portfolio
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
