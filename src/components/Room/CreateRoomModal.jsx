import React, { useState, useRef } from 'react';
import { X, Home, Upload, AlertCircle, QrCode, Smartphone } from 'lucide-react';
import api from '../../utils/api';
import {
  validateUpiId,
  validateMobileNumber,
  validateQRCodeFile,
  validatePaymentDetails,
} from '../../utils/paymentValidation';
import styles from './RoomModals.module.css';

export default function CreateRoomModal({ onClose, onCreated }) {
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    roomType: 'individual',
    paymentDetails: {
      enabled: false,
      upiId: '',
      mobileNumber: '',
      qrCodeData: null,
      qrCodeUrl: null,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [qrPreview, setQrPreview] = useState(null);
  const [uploadingQR, setUploadingQR] = useState(false);

  // Handle room basic info change
  const handleBasicChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [field]: null }));
  };

  // Handle room type change
  const handleRoomTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      roomType: type,
    }));
    setError('');
  };

  // Toggle payment setup
  const togglePaymentSetup = () => {
    setForm(prev => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        enabled: !prev.paymentDetails.enabled,
      },
    }));
    setError('');
  };

  // Handle payment input change
  const handlePaymentChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [field]: value,
      },
    }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [field]: null }));
  };

  // Handle UPI ID blur - validate
  const handleUpiBlur = () => {
    if (form.paymentDetails.upiId.trim()) {
      const validation = validateUpiId(form.paymentDetails.upiId);
      setFieldErrors(prev => ({
        ...prev,
        upiId: validation.valid ? null : validation.error,
      }));
    }
  };

  // Handle mobile number blur - validate
  const handleMobileBlur = () => {
    if (form.paymentDetails.mobileNumber.trim()) {
      const validation = validateMobileNumber(form.paymentDetails.mobileNumber);
      setFieldErrors(prev => ({
        ...prev,
        mobileNumber: validation.valid ? null : validation.error,
      }));
    }
  };

  // Handle QR code file upload
  const handleQRFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const fileValidation = validateQRCodeFile(file);
    if (!fileValidation.valid) {
      setFieldErrors(prev => ({ ...prev, qrCode: fileValidation.error }));
      return;
    }

    setUploadingQR(true);
    try {
      // Convert file to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        setForm(prev => ({
          ...prev,
          paymentDetails: {
            ...prev.paymentDetails,
            qrCodeData: base64Data,
          },
        }));
        setQrPreview(base64Data);
        setFieldErrors(prev => ({ ...prev, qrCode: null }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFieldErrors(prev => ({ ...prev, qrCode: 'Failed to upload QR code' }));
    } finally {
      setUploadingQR(false);
    }
  };

  // Remove QR code
  const removeQRCode = () => {
    setQrPreview(null);
    setForm(prev => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        qrCodeData: null,
        qrCodeUrl: null,
      },
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Validate form and submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate basic fields
    if (!form.name.trim()) {
      setFieldErrors(prev => ({ ...prev, name: 'Room name is required' }));
      return;
    }

    // Validate payment details if enabled
    if (form.paymentDetails.enabled) {
      const paymentValidation = validatePaymentDetails(form.paymentDetails);
      if (!paymentValidation.valid) {
        setError(paymentValidation.errors?.[0] || 'Invalid payment details');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post('/rooms', form);
      onCreated(res.data.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0] || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Create Expense Room</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-400)' }}>Set up a shared expense space</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Basic Info Section */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--ink-900)' }}>
                Basic Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Room Name *</label>
                  <input
                    className="form-input"
                    placeholder="Trip to Goa, Monthly Groceries…"
                    value={form.name}
                    onChange={e => handleBasicChange('name', e.target.value)}
                    maxLength={50}
                    autoFocus
                    style={{
                      borderColor: fieldErrors.name ? 'var(--red-500)' : undefined,
                    }}
                  />
                  {fieldErrors.name && (
                    <p style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 4 }}>
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Description (optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="What is this room for?"
                    value={form.description}
                    onChange={e => handleBasicChange('description', e.target.value)}
                    maxLength={200}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>
            </div>

            {/* Room Type Section */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--ink-900)' }}>
                Room Type
              </h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="roomType"
                    value="individual"
                    checked={form.roomType === 'individual'}
                    onChange={() => handleRoomTypeChange('individual')}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontWeight: 500 }}>Individual</span>
                  <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4, marginLeft: 24 }}>
                    Personal expense tracking
                  </p>
                </label>
                <label style={{ flex: 1, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="roomType"
                    value="group"
                    checked={form.roomType === 'group'}
                    onChange={() => handleRoomTypeChange('group')}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontWeight: 500 }}>Group Collaborative</span>
                  <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4, marginLeft: 24 }}>
                    Collaborative group expenses
                  </p>
                </label>
              </div>
            </div>

            {/* Payment Setup Section - Only for Group Collaborative */}
            {form.roomType === 'group' && (
              <div style={{ padding: 12, backgroundColor: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    id="enablePayment"
                    checked={form.paymentDetails.enabled}
                    onChange={togglePaymentSetup}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="enablePayment" style={{ cursor: 'pointer', fontWeight: 600 }}>
                    Enable Payment Settlement
                  </label>
                </div>

                {form.paymentDetails.enabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-200)' }}>
                    <p style={{ fontSize: 13, color: 'var(--ink-600)' }}>
                      Add at least one payment method so members can send settlements
                    </p>

                    {/* UPI ID Input */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Smartphone size={14} />
                        UPI ID (optional)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="username@upi or username@bankcode"
                        value={form.paymentDetails.upiId}
                        onChange={e => handlePaymentChange('upiId', e.target.value)}
                        onBlur={handleUpiBlur}
                        maxLength={70}
                        style={{
                          borderColor: fieldErrors.upiId ? 'var(--red-500)' : undefined,
                        }}
                      />
                      {fieldErrors.upiId && (
                        <p style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 4 }}>
                          {fieldErrors.upiId}
                        </p>
                      )}
                      {!fieldErrors.upiId && form.paymentDetails.upiId && (
                        <p style={{ fontSize: 12, color: 'var(--green-600)', marginTop: 4 }}>
                          ✓ Valid UPI ID
                        </p>
                      )}
                    </div>

                    {/* Mobile Number Input */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Smartphone size={14} />
                        Mobile Number (optional)
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="10-digit mobile number"
                        value={form.paymentDetails.mobileNumber}
                        onChange={e => handlePaymentChange('mobileNumber', e.target.value)}
                        onBlur={handleMobileBlur}
                        maxLength={13}
                        style={{
                          borderColor: fieldErrors.mobileNumber ? 'var(--red-500)' : undefined,
                        }}
                      />
                      {fieldErrors.mobileNumber && (
                        <p style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 4 }}>
                          {fieldErrors.mobileNumber}
                        </p>
                      )}
                      {!fieldErrors.mobileNumber && form.paymentDetails.mobileNumber && (
                        <p style={{ fontSize: 12, color: 'var(--green-600)', marginTop: 4 }}>
                          ✓ Valid mobile number
                        </p>
                      )}
                    </div>

                    {/* QR Code Upload */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <QrCode size={14} />
                        QR Code for UPI (optional)
                      </label>
                      {!qrPreview ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingQR}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: 12,
                          }}
                        >
                          <Upload size={16} />
                          {uploadingQR ? 'Uploading…' : 'Upload QR Code'}
                        </button>
                      ) : (
                        <div style={{ position: 'relative', width: 120, height: 120 }}>
                          <img
                            src={qrPreview}
                            alt="QR Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 8,
                              border: '2px solid var(--green-500)',
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={removeQRCode}
                            style={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              width: 24,
                              height: 24,
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              backgroundColor: 'var(--red-500)',
                              color: 'white',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleQRFileSelect}
                        style={{ display: 'none' }}
                      />
                      {fieldErrors.qrCode && (
                        <p style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 4 }}>
                          {fieldErrors.qrCode}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 8 }}>
                        PNG, JPG, or WebP • Max 2MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating…
                </>
              ) : (
                <>
                  <Home size={15} />
                  Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
