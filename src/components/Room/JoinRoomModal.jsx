import React, { useState } from 'react';
import { X, Hash } from 'lucide-react';
import api from '../../utils/api';
import styles from './RoomModals.module.css';

export default function JoinRoomModal({ onClose, onJoined }) {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) { setError('Please enter a Room ID.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/rooms/join', { roomId: roomId.trim().toUpperCase() });
      onJoined(res.data.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join room. Check the ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Join a Room</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-400)' }}>Enter the 8-character Room ID</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Room ID</label>
              <div style={{ position: 'relative' }}>
                <Hash size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 40, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.1em', fontSize: 17 }}
                  placeholder="AB12CD34"
                  value={roomId}
                  onChange={e => { setRoomId(e.target.value.slice(0, 8)); setError(''); }}
                  maxLength={8}
                  autoFocus
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4 }}>
                Ask the room host to share their Room ID.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || roomId.length < 6}>
              {loading ? <><span className="spinner" />Joining…</> : <><Hash size={15} />Join Room</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
