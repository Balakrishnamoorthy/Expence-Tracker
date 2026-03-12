import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { validatePaymentAmount } from '../../utils/paymentValidation';
import { openUPIApp, formatCurrencyAmount } from '../../utils/upiIntegration';
import styles from './Payment.module.css';

export default function UPIPaymentModal({
  upiId,
  mobileNumber,
  hostName,
  roomName,
  roomId,
  onClose,
}) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
  };

  const handleAmountBlur = () => {
    if (amount.trim()) {
      const validation = validatePaymentAmount(amount);
      if (!validation.valid) {
        setError(validation.error);
      }
    }
  };

  const handleSendPayment = async () => {
    setError('');

    // Validate amount
    if (!amount.trim()) {
      setError('Please enter an amount');
      return;
    }

    const validation = validatePaymentAmount(amount);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const finalAmount = validation.normalized;

    setLoading(true);
    try {
      // Open UPI app with pre-filled details
      const result = openUPIApp({
        upiId: upiId || `${mobileNumber}@upi`,
        amount: finalAmount,
        roomName,
        roomId,
        hostName,
      });

      if (result.success) {
        // Close modal after opening UPI app
        setTimeout(onClose, 500);
      } else {
        setError(result.error || 'Failed to open UPI app');
      }
    } catch (err) {
      setError('Failed to open payment app');
    } finally {
      setLoading(false);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const displayAmount = numAmount > 0 ? formatCurrencyAmount(numAmount) : '₹0';

  return (
    <div className={styles.upiModal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.upiModalContent}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--ink-900)' }}>
            Send Settlement
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Amount Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-700)', display: 'block', marginBottom: 8 }}>
            Amount to Send *
          </label>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              background: 'var(--gray-50)',
              borderRadius: 8,
              padding: '4px 12px',
              border: error ? '1px solid #ef4444' : '1px solid var(--gray-300)',
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-900)' }}>₹</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="1"
              max="100000"
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="Enter amount"
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ink-900)',
                outline: 'none',
              }}
            />
          </div>
          {error && (
            <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={14} />
              {error}
            </p>
          )}
        </div>

        {/* Amount Preview */}
        <div className={styles.amountPreview}>{displayAmount}</div>

        {/* Payment Details */}
        <div className={styles.paymentInfo}>
          <div className={styles.paymentInfoItem}>
            <span className={styles.paymentInfoLabel}>Recipient:</span>
            <span className={styles.paymentInfoValue}>{hostName || 'Room Host'}</span>
          </div>
          <div className={styles.paymentInfoItem}>
            <span className={styles.paymentInfoLabel}>Expense:</span>
            <span className={styles.paymentInfoValue}>{roomName}</span>
          </div>
          <div className={styles.paymentInfoItem}>
            <span className={styles.paymentInfoLabel}>Payment Method:</span>
            <span className={styles.paymentInfoValue}>UPI</span>
          </div>
        </div>

        {/* Info Note */}
        <div
          style={{
            background: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: 6,
            padding: 10,
            marginBottom: 16,
            fontSize: 12,
            color: '#1e40af',
            display: 'flex',
            gap: 8,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0 }}>
            You will be directed to your UPI app to complete the payment
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className={`${styles.modalActionButton} ${styles.primaryButton}`}
            onClick={handleSendPayment}
            disabled={loading || !amount.trim()}
            style={{
              opacity: loading || !amount.trim() ? 0.6 : 1,
              cursor: loading || !amount.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Opening UPI…
              </>
            ) : (
              <>
                <Send size={16} />
                Send {displayAmount}
              </>
            )}
          </button>
          <button
            className={`${styles.modalActionButton} ${styles.outlineButton}`}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
