'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Video, Save, AlertCircle } from 'lucide-react';
import { VideoItem } from '@/types/portfolio';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<VideoItem, 'id'>>({
    title: '',
    description: '',
    youtubeUrl: '',
    embedId: '',
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/videos');
      const data = await res.json();
      if (data.videos) setVideos(data.videos);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load videos.' });
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url;
  };

  const handleUrlChange = (url: string) => {
    const id = extractYouTubeId(url);
    setFormData({
      ...formData,
      youtubeUrl: url,
      embedId: id,
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      embedId: '',
      order_index: videos.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: VideoItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      youtubeUrl: item.youtubeUrl,
      embedId: item.embedId,
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    await saveToBackend(updated);
  };

  const handleToggleActive = async (id: string) => {
    const updated = videos.map((v) =>
      v.id === id ? { ...v, is_active: !v.is_active } : v
    );
    setVideos(updated);
    await saveToBackend(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: VideoItem[];

    if (editingId) {
      updated = videos.map((item) =>
        item.id === editingId ? { ...formData, id: editingId } : item
      );
    } else {
      const newItem: VideoItem = {
        ...formData,
        id: `vid-${Date.now()}`,
      };
      updated = [...videos, newItem];
    }

    updated.sort((a, b) => a.order_index - b.order_index);
    setVideos(updated);
    setIsModalOpen(false);
    await saveToBackend(updated);
  };

  const saveToBackend = async (data: VideoItem[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Videos updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving videos' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-header-title">YouTube Videos &amp; Content</h1>
          <p className="admin-header-sub">
            Add YouTube video embeds, tutorial titles, and descriptions.
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          <span>Add New Video</span>
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
        <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading videos...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {videos.map((item) => (
            <div key={item.id} className="admin-card" style={{ marginBottom: 0, padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000000' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${item.embedId}`}
                  title={item.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{item.title}</h3>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>#{item.order_index}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem' }}>{item.description}</p>

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
                {editingId ? 'Edit Video' : 'Add New Video'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-form-group">
                <label className="admin-label">Video Title *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Git &amp; GitHub Complete Tutorial"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">YouTube Video URL or Video ID *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. https://www.youtube.com/watch?v=BQjqaXrI2V4"
                  value={formData.youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
                  Detected Embed ID: {formData.embedId || 'None'}
                </span>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="vidActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <label htmlFor="vidActive" style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Visible on Live Portfolio
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Video' : 'Add Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
