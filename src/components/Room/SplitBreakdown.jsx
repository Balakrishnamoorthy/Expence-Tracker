import React from 'react';
import { Users, Check, Clock, Send } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import styles from './SplitBreakdown.module.css';

/**
 * Component to display transaction splits with payment flow
 * Split Creator: Can mark others as settled
 * Payers: See "Pay Split" button that opens UPI app
 */
export default function SplitBreakdown({ 
  splits, 
  isPaid = false, 
  onMarkSettled,
  currentUserId = null,
  splitCreatorId = null,
  splitCreatorUpiId = null,
  splitAmount = 0,
}) {
  if (!splits || splits.length === 0) {
    return null;
  }

  const settled = splits.filter(s => s.settled).length;
  const total = splits.length;
  const percentageSettled = Math.round((settled / total) * 100);

  const isCurrentUserCreator = currentUserId && splitCreatorId && currentUserId.toString() === splitCreatorId.toString();

  const handlePaySplit = (split) => {
    if (!splitCreatorUpiId) {
      alert('UPI ID not available. Please contact the split creator.');
      return;
    }

    const upiId = splitCreatorUpiId.trim();
    const amount = split.amount;
    const transactionRef = `SPLIT-${Date.now()}`;
    const description = 'Payment for expense split';

    // UPI Deep Link Format (NPCI spec)
    // Important: Don't encode the UPI ID itself - it breaks phone numbers and UPI addresses
    // Only encode the descriptive text parts
    const upiLink = `upi://pay?pa=${upiId}&pn=Expence%20Tracker&am=${amount}&tr=${transactionRef}&tn=${description}`;

    // Try to open UPI app
    window.location.href = upiLink;
  };

  return (
    <div className={styles.splitContainer}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} />
          <h4 className={styles.title}>Split Among {total} Member{total !== 1 ? 's' : ''}</h4>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${percentageSettled}%` }} />
        </div>
        <span className={styles.progressText}>
          {settled}/{total} settled
        </span>
      </div>

      <div className={styles.splitsList}>
        {splits.map((split, index) => {
          const splitUser = split.user?.fullName || split.user || 'Unknown';
          const userId = split.user?._id || split.user;
          const isCurrentUserPayer = currentUserId && userId && currentUserId.toString() === userId.toString();
          
          return (
            <div key={index} className={styles.splitItem}>
              <div className={styles.splitLeft}>
                <div className={styles.splitAvatar}>
                  {splitUser.charAt(0).toUpperCase()}
                </div>
                <div className={styles.splitInfo}>
                  <div className={styles.splitName}>{splitUser}</div>
                  <div className={styles.splitAmount}>
                    {formatCurrency(split.amount)}
                  </div>
                </div>
              </div>

              <div className={styles.splitRight}>
                {split.settled && (
                  <div className={styles.settledBadge}>
                    <Check size={14} /> Settled
                  </div>
                )}
                {!split.settled && isCurrentUserCreator && onMarkSettled && (
                  <button
                    className={styles.settleButton}
                    onClick={() => onMarkSettled(userId)}
                    title={`Mark ${splitUser}'s split as settled`}
                  >
                    <Clock size={14} /> Mark Settled
                  </button>
                )}
                {!split.settled && isCurrentUserPayer && (
                  <button
                    className={styles.payButton}
                    onClick={() => handlePaySplit(split)}
                    title="Pay this split via UPI"
                  >
                    <Send size={14} /> Pay Split
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
