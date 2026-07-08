import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Calendar, Wallet, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getPendingRoomInvite, clearPendingRoomInvite } from '../utils/inviteFlow';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: '', dateOfBirth: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.dateOfBirth) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form.phone, form.dateOfBirth);
      toast.success('Welcome back! 👋');
      const pendingRoomId = getPendingRoomInvite();
      if (pendingRoomId) {
        clearPendingRoomInvite();
        navigate(`/join/${pendingRoomId}`, { replace: true });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.logoMark}><Wallet size={28} /></div>
          <h1 className={styles.heroTitle}>Track expenses<br />together.</h1>
          <p className={styles.heroSub}>
            Create shared expense rooms, track income and spending, and generate instant reports — all in one place.
          </p>
          <div className={styles.features}>
            {['Collaborative expense rooms', 'Real-time balance tracking', 'PDF report generation', 'WhatsApp sharing'].map(f => (
              <div key={f} className={styles.feature}>
                <div className={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.grid} aria-hidden="true">
          {Array.from({ length: 80 }).map((_, i) => <div key={i} className={styles.gridDot} />)}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Sign In</h2>
            <p className={styles.formSub}>Enter your phone and date of birth</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {error && (
              <div className={styles.errorBanner}>{error}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div className={styles.inputWrap}>
                <Phone size={15} className={styles.inputIcon} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-input ${styles.paddedInput} ${error ? 'error' : ''}`}
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateOfBirth">Date of Birth</label>
              <div className={styles.inputWrap}>
                <Calendar size={15} className={styles.inputIcon} />
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  className={`form-input ${styles.paddedInput} ${error ? 'error' : ''}`}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading}>
              {loading ? <><span className="spinner" />Signing In…</> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.switchLink}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
