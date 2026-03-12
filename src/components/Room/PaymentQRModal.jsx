import React from 'react';
import { X, Copy, Send, QrCode } from 'lucide-react';
import { copyToClipboard, openUPIApp } from '../../utils/upiIntegration';
import styles from './Payment.module.css';

export default function PaymentQRModal({
  qrCodeData,
  upiId,
  hostName,
  roomName,
  roomId,
  onClose,
}) {
  const handleCopyUPI = async () => {
    if (!upiId) return;
    const result = await copyToClipboard(upiId, 'UPI ID');
    if (result.success) {
      alert(result.message);
    }
  };

  const handleOpenUPI = () => {
    openUPIApp({
      upiId,
      amount: 0,
      roomName,
      roomId,
      hostName,
    });
  };

  return (
    <div className={styles.qrModal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.qrModalContent}>
        {/* Header */}
        <div className={styles.qrModalHeader}>
          <h3 className={styles.qrModalTitle}>
            <QrCode size={18} /> Payment QR Code
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* QR Code Display */}
        <div className={styles.qrDisplay}>
          <img src={qrCodeData} alt="Payment QR Code" className={styles.qrImage} />
          <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: '12px 0 0 0' }}>
            Scan with UPI app
          </p>
        </div>

        {/* UPI ID (if available) */}
        {upiId && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--ink-500)', margin: '0 0 8px 0' }}>
              UPI ID
            </p>
            <div
              style={{
                display: 'flex',
                gap: 8,
                background: 'var(--gray-50)',
                padding: 10,
                borderRadius: 6,
              }}
            >
              <code
                style={{
                  flex: 1,
                  fontFamily: "'Monaco', 'Courier New', monospace",
                  fontSize: 12,
                  wordBreak: 'break-word',
                  color: 'var(--ink-900)',
                }}
              >
                {upiId}
              </code>
              <button
                className={styles.copyButton}
                onClick={handleCopyUPI}
                title="Copy UPI ID"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-600)',
                  padding: 0,
                }}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.modalActions}>
          <button
            className={`${styles.modalActionButton} ${styles.primaryButton}`}
            onClick={handleOpenUPI}
          >
            <Send size={16} />
            Open UPI App
          </button>
          <button
            className={`${styles.modalActionButton} ${styles.outlineButton}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
