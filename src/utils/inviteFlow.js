const PENDING_ROOM_INVITE_KEY = 'pendingRoomInvite';
const PROCESSING_ROOM_INVITE_KEY = 'processingRoomInvite';

export const getPendingRoomInvite = () => {
  if (typeof window === 'undefined') return null;
  const value = sessionStorage.getItem(PENDING_ROOM_INVITE_KEY);
  return value ? value.toUpperCase() : null;
};

export const setPendingRoomInvite = (roomId) => {
  if (typeof window === 'undefined') return;
  if (!roomId) {
    sessionStorage.removeItem(PENDING_ROOM_INVITE_KEY);
    sessionStorage.removeItem(PROCESSING_ROOM_INVITE_KEY);
    return;
  }
  sessionStorage.setItem(PENDING_ROOM_INVITE_KEY, roomId.trim().toUpperCase());
};

export const clearPendingRoomInvite = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_ROOM_INVITE_KEY);
  sessionStorage.removeItem(PROCESSING_ROOM_INVITE_KEY);
};

export const beginRoomInviteJoin = (roomId) => {
  if (typeof window === 'undefined') return false;
  const normalizedRoomId = roomId?.trim().toUpperCase();
  if (!normalizedRoomId) return false;

  const processingRoomId = sessionStorage.getItem(PROCESSING_ROOM_INVITE_KEY);
  if (processingRoomId === normalizedRoomId) return false;

  sessionStorage.setItem(PROCESSING_ROOM_INVITE_KEY, normalizedRoomId);
  return true;
};

export const completeRoomInviteJoin = (roomId) => {
  if (typeof window === 'undefined') return;
  const normalizedRoomId = roomId?.trim().toUpperCase();
  const processingRoomId = sessionStorage.getItem(PROCESSING_ROOM_INVITE_KEY);
  if (!normalizedRoomId || processingRoomId !== normalizedRoomId) return;
  sessionStorage.removeItem(PROCESSING_ROOM_INVITE_KEY);
};

export const buildRoomInviteUrl = (roomId) => {
  if (!roomId) return '';
  const baseUrl = window.location.origin || import.meta.env.VITE_APP_URL || '';
  return `${baseUrl}/join/${roomId.trim().toUpperCase()}`;
};
