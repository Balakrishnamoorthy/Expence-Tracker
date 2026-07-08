import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import {
  clearPendingRoomInvite,
  setPendingRoomInvite,
  beginRoomInviteJoin,
  completeRoomInviteJoin,
} from '../utils/inviteFlow';

export default function JoinInviteRoute() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const toast = useToast();
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const normalizedRoomId = roomId.trim().toUpperCase();
    setPendingRoomInvite(normalizedRoomId);

    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (!beginRoomInviteJoin(normalizedRoomId)) {
      return;
    }

    const joinRoom = async () => {
      setJoining(true);
      try {
        await api.post('/rooms/join', { roomId: normalizedRoomId });
        completeRoomInviteJoin(normalizedRoomId);
        clearPendingRoomInvite();
        toast.success('You joined the room!');
        navigate(`/room/${normalizedRoomId}`, { replace: true });
      } catch (err) {
        completeRoomInviteJoin(normalizedRoomId);
        clearPendingRoomInvite();
        toast.error(err.response?.data?.message || 'Could not join this room right now.');
        navigate('/dashboard', { replace: true });
      } finally {
        setJoining(false);
      }
    };

    joinRoom();
  }, [roomId, loading, navigate, toast, user]);

  if (loading || joining) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32, color: 'var(--ink-400)' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return null;
}
