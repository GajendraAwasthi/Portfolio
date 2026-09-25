'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Terminal, Save, AlertCircle } from 'lucide-react';
import { TerminalCommand } from '@/types/portfolio';

export default function AdminTerminalPage() {
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<TerminalCommand, 'id'>>({
    command: '',
    output: '',
    description: '',
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchCommands();
  }, []);

  const fetchCommands = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data/terminalCommands');
      const data = await res.json();
      if (data.terminalCommands) setCommands(data.terminalCommands);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load terminal commands.' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      command: '',
      output: '',
      description: '',
      order_index: commands.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: TerminalCommand) => {
    setEditingId(item.id);
    setFormData({
      command: item.command,
      output: item.output,
      description: item.description,
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this command?')) return;
    const updated = commands.filter((c) => c.id !== id);
    setCommands(updated);
    await saveToBackend(updated);
  };

  const handleToggleActive = async (id: string) => {
    const updated = commands.map((c) =>
      c.id === id ? { ...c, is_active: !c.is_active } : c
    );
    setCommands(updated);
    await saveToBackend(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updated: TerminalCommand[];

    if (editingId) {
      updated = commands.map((item) =>
        item.id === editingId ? { ...formData, id: editingId } : item
      );
    } else {
      const newItem: TerminalCommand = {
        ...formData,
        id: `cmd-${Date.now()}`,
      };
      updated = [...commands, newItem];
    }

    updated.sort((a, b) => a.order_index - b.order_index);
    setCommands(updated);
    setIsModalOpen(false);
    await saveToBackend(updated);
  };

  const saveToBackend = async (data: TerminalCommand[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/data/terminalCommands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      setMessage({ type: 'success', text: result.message || 'Commands updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving terminal commands' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-header-title">Interactive Terminal Commands</h1>
          <p className="admin-header-sub">
            Customize commands that visitors can type into the portfolio interactive terminal.
          </p>
        </div>

        <button onClick={openAddModal} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          <span>Add New Command</span>
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
        <div style={{ color: '#94a3b8', padding: '2rem' }}>Loading commands...</div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Command</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: '#94a3b8', fontWeight: 600 }}>#{item.order_index}</td>
                  <td>
                    <code style={{ background: '#0a0e17', color: '#22c55e', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
                      $ {item.command}
                    </code>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{item.description}</td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`admin-badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {item.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditModal(item)} className="admin-btn admin-btn-secondary" style={{ padding: '0.4rem 0.75rem' }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="admin-btn admin-btn-danger" style={{ padding: '0.4rem 0.75rem' }}>
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
                {editingId ? 'Edit Terminal Command' : 'Add New Terminal Command'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label className="admin-label">Command (lowercase word) *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. secret, certifications"
                    value={formData.command}
                    onChange={(e) => setFormData({ ...formData, command: e.target.value.toLowerCase().trim() })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Display Order</label>
                  <input
                    type="number"
                    className="admin-input"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Brief Description *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Display certifications and badges"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Terminal Output Text (Supports multi-line text) *</label>
                <textarea
                  className="admin-textarea"
                  rows={6}
                  style={{ fontFamily: 'monospace', color: '#22c55e', background: '#0a0e17' }}
                  placeholder="Text that prints when this command is run..."
                  value={formData.output}
                  onChange={(e) => setFormData({ ...formData, output: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="cmdActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <label htmlFor="cmdActive" style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                  Enable this command
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Command' : 'Add Command'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
