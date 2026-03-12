import React, { useState } from 'react';
import { QrCode, Copy, Send, Smartphone, AlertCircle } from 'lucide-react';
import { formatPhoneNumber, maskUpiId } from '../../utils/paymentValidation';
import { copyToClipboard, openUPIApp } from '../../utils/upiIntegration';
import PaymentQRModal from './PaymentQRModal';
import UPIPaymentModal from './UPIPaymentModal';
import styles from './Payment.module.css';

export default function PaymentSettlementCard({ room, hostName }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);

  if (!room?.paymentDetails?.enabled) {
    return null;
  }

  const { paymentDetails } = room;
  const hasUpiId = paymentDetails.upiId?.trim();
  const hasMobileNumber = paymentDetails.mobileNumber?.trim();
  const hasQRCode = paymentDetails.qrCodeData || paymentDetails.qrCodeUrl;

  const handleCopyUPI = async () => {
    if (!hasUpiId) return;
    const result = await copyToClipboard(paymentDetails.upiId, 'UPI ID');
    if (result.success) {
      // Show toast notification
      alert(result.message);
    }
  };

  const handleCopyMobile = async () => {
    if (!hasMobileNumber) return;
    const result = await copyToClipboard(paymentDetails.mobileNumber, 'Mobile Number');
    if (result.success) {
      alert(result.message);
    }
  };

  const handleSendSettlement = () => {
    if (hasUpiId) {
      setShowUPIModal(true);
    } else if (hasMobileNumber) {
      // Open UPI app with mobile number
      openUPIApp({
        upiId: `${hasMobileNumber}@upi`,
        amount: 0, // User will enter amount
        roomName: room.name,
        roomId: room.roomId,
        hostName: hostName || 'Room Host',
      });
    }
  };

  return (
    <>
      <div className={styles.settlementCard}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>
              <Send size={16} /> Payment Settlement
            </h3>
            <p className={styles.cardSubtitle}>
              Send money to {hostName || 'the host'} for settlement
            </p>
          </div>
        </div>

        {/* Content */}
        <div className={styles.cardContent}>
          {/* Host Info */}
          <div className={styles.hostInfo}>
            <div className={styles.hostAvatarPlaceholder}>
              {hostName?.charAt(0)?.toUpperCase() || 'H'}
            </div>
            <div>
              <p className={styles.hostLabel}>Account Holder</p>
              <p className={styles.hostName}>{hostName || 'Room Host'}</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className={styles.paymentMethods}>
            {/* QR Code */}
            {hasQRCode && (
              <div className={styles.methodRow}>
                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className={styles.methodButton}
                >
                  <div className={styles.qrThumbnail}>
                    <img
                      src={paymentDetails.qrCodeData || paymentDetails.qrCodeUrl}
                      alt="Payment QR Code"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className={styles.methodName}>
                      <QrCode size={14} /> UPI QR Code
                    </p>
                    <p className={styles.methodDesc}>Click to view full QR code</p>
                  </div>
                  <span className={styles.methodIcon}>→</span>
                </button>
              </div>
            )}

            {/* UPI ID */}
            {hasUpiId && (
              <div className={styles.methodRow}>
                <div className={styles.methodItem}>
                  <div>
                    <p className={styles.methodName}>
                      <Smartphone size={14} /> UPI ID
                    </p>
                    <p className={styles.methodValue}>{maskUpiId(paymentDetails.upiId)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    className={styles.copyButton}
                    title="Copy UPI ID"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Number */}
            {hasMobileNumber && (
              <div className={styles.methodRow}>
                <div className={styles.methodItem}>
                  <div>
                    <p className={styles.methodName}>
                      <Smartphone size={14} /> Mobile Number
                    </p>
                    <p className={styles.methodValue}>{formatPhoneNumber(paymentDetails.mobileNumber)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMobile}
                    className={styles.copyButton}
                    title="Copy Mobile Number"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className={styles.infoNote}>
            <AlertCircle size={14} />
            <p>Payment information is visible only to room members</p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSendSettlement}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <Send size={14} /> Send Settlement
          </button>
        </div>
      </div>

      {/* Modals */}
      {showQRModal && (
        <PaymentQRModal
          qrCodeData={paymentDetails.qrCodeData || paymentDetails.qrCodeUrl}
          upiId={paymentDetails.upiId}
          hostName={hostName}
          roomName={room.name}
          roomId={room.roomId}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {showUPIModal && (
        <UPIPaymentModal
          upiId={paymentDetails.upiId}
          mobileNumber={paymentDetails.mobileNumber}
          hostName={hostName}
          roomName={room.name}
          roomId={room.roomId}
          onClose={() => setShowUPIModal(false)}
        />
      )}
    </>
  );
}
