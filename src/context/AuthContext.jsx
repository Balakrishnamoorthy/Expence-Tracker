import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('et_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('et_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('et_token');
        localStorage.removeItem('et_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (phone, dateOfBirth) => {
    const res = await api.post('/auth/login', { phone, dateOfBirth });
    const { token, user } = res.data;
    localStorage.setItem('et_token', token);
    localStorage.setItem('et_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (fullName, phone, dateOfBirth) => {
    const res = await api.post('/auth/register', { fullName, phone, dateOfBirth });
    const { token, user } = res.data;
    localStorage.setItem('et_token', token);
    localStorage.setItem('et_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    localStorage.setItem('et_user', JSON.stringify(res.data.user));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
