import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../utils/api';
import styles from './AddTransactionModal.module.css';

const INCOME_CATEGORIES = ['Salary', 'Contribution', 'Refund', 'Investment', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other'];

const CATEGORY_ICONS = {
  Salary: 'Briefcase', Contribution: 'Users', Refund: 'RotateCcw', Investment: 'TrendingUp',
  Gift: 'Gift', Food: 'UtensilsCrossed', Travel: 'Plane', Rent: 'Home',
  Utilities: 'Zap', Entertainment: 'Tv', Shopping: 'ShoppingBag',
  Healthcare: 'Heart', Education: 'BookOpen', Other: 'DollarSign',
};

export default function AddTransactionModal({ roomId, onClose, onAdded, roomMembers = [] }) {
  const [type, setType] = useState('expense');
  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [createEqualSplit, setCreateEqualSplit] = useState(false);
  const [splitCreatorUpiId, setSplitCreatorUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid amount.'); return; }
    if (!form.category) { setError('Please select a category.'); return; }
    if (createEqualSplit && !splitCreatorUpiId.trim()) { setError('UPI ID is required for splits.'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        type,
        amount: parseFloat(form.amount),
        icon: CATEGORY_ICONS[form.category] || 'DollarSign',
      };
      
      // Add split config if expense and split is enabled
      if (type === 'expense' && createEqualSplit) {
        payload.createEqualSplit = true;
        payload.splitCreatorUpiId = splitCreatorUpiId.trim();
      }

      const res = await api.post(`/transactions/${roomId}`, payload);
      onAdded(res.data.transaction);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Add Transaction</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-400)' }}>Record income or expense</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <div className={styles.error}>{error}</div>}

            {/* Type Toggle */}
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'income' ? styles.typeBtnIncome : ''}`}
                onClick={() => { setType('income'); setForm(p => ({ ...p, category: '' })); setError(''); }}
              >
                <TrendingUp size={15} />
                Income
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${type === 'expense' ? styles.typeBtnExpense : ''}`}
                onClick={() => { setType('expense'); setForm(p => ({ ...p, category: '' })); setError(''); }}
              >
                <TrendingDown size={15} />
                Expense
              </button>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)', fontSize: 16, fontWeight: 600 }}>₹</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: 34 }}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={e => { setForm(p => ({...p, amount: e.target.value})); setError(''); }}
                  autoFocus
                />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <div className={styles.categoryGrid}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.categoryChip} ${form.category === cat ? (type === 'income' ? styles.categoryChipIncome : styles.categoryChipExpense) : ''}`}
                    onClick={() => setForm(p => ({...p, category: cat}))}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="What's this for?"
                value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))}
                maxLength={200}
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={e => setForm(p => ({...p, date: e.target.value}))}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Split Option - Only for Expenses */}
            {type === 'expense' && (
              <div className={styles.splitOption}>
                <label className={styles.splitCheckbox}>
                  <input
                    type="checkbox"
                    checked={createEqualSplit}
                    onChange={(e) => setCreateEqualSplit(e.target.checked)}
                  />
                  <span className={styles.splitLabel}>
                    Create Equal Split
                    {createEqualSplit && roomMembers.length > 0 && (
                      <span className={styles.splitInfo}>
                        ₹{(parseFloat(form.amount) / roomMembers.length || 0).toFixed(2)} per person
                      </span>
                    )}
                  </span>
                </label>

                {/* UPI ID Input - Shows when split is enabled */}
                {createEqualSplit && (
                  <div className={styles.upiIdInput}>
                    <label className="form-label" style={{ marginBottom: 8, marginTop: 12 }}>Your UPI ID *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="yourname@bankname or +91XXXXXXXXXX"
                      value={splitCreatorUpiId}
                      onChange={e => setSplitCreatorUpiId(e.target.value)}
                      spellCheck="false"
                    />
                    <p style={{ fontSize: 12, color: 'var(--ink-400)', marginTop: 6 }}>
                      Others will use this to send you their split amount
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={`btn ${type === 'income' ? 'btn-emerald' : 'btn-rose'}`}
              disabled={loading}
            >
              {loading ? <><span className="spinner" />Adding…</> : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
