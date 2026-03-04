import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Calendar, User, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', phone: '', dateOfBirth: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.dateOfBirth) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await register(form.fullName.trim(), form.phone.trim(), form.dateOfBirth);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.logoMark}><Wallet size={28} /></div>
          <h1 className={styles.heroTitle}>Start tracking<br />smarter.</h1>
          <p className={styles.heroSub}>
            Join thousands of users managing shared expenses collaboratively. Sign up takes less than 30 seconds.
          </p>
          <div className={styles.features}>
            {['No credit card needed', 'Free to use', 'Instant room creation', 'Secure & private'].map(f => (
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
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formSub}>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <div className={styles.inputWrap}>
                <User size={15} className={styles.inputIcon} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={`form-input ${styles.paddedInput}`}
                  placeholder="Ravi Kumar"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div className={styles.inputWrap}>
                <Phone size={15} className={styles.inputIcon} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`form-input ${styles.paddedInput}`}
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
                  className={`form-input ${styles.paddedInput}`}
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 4 }}>
                Used as your login password — keep it safe.
              </p>
            </div>

            <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading}>
              {loading ? <><span className="spinner" />Creating Account…</> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
