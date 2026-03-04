import React, { useState } from 'react';
import { X, Home } from 'lucide-react';
import api from '../../utils/api';
import styles from './RoomModals.module.css';

export default function CreateRoomModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Room name is required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/rooms', form);
      onCreated(res.data.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Create Expense Room</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-400)' }}>Set up a shared expense space</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Room Name *</label>
              <input
                className="form-input"
                placeholder="Trip to Goa, Monthly Groceries…"
                value={form.name}
                onChange={e => { setForm(p => ({...p, name: e.target.value})); setError(''); }}
                maxLength={50}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-input"
                placeholder="What is this room for?"
                value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))}
                maxLength={200}
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" />Creating…</> : <><Home size={15} />Create Room</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
