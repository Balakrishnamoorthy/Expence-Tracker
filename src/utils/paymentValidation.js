/**
 * Payment Validation Utilities (Frontend)
 * Shared validation rules for payment settlement feature
 * Validates UPI IDs, mobile numbers, and file uploads
 */

// UPI ID Pattern: username@bankcode
const UPI_PATTERN = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9]{2,}$/;

// Mobile number with optional country code
const MOBILE_PATTERN = /^(\+91|91|\+)?[6-9]\d{9}$/;

/**
 * Validate UPI ID format
 */
export const validateUpiId = (upiId) => {
  if (!upiId || typeof upiId !== 'string') {
    return { valid: false, error: 'UPI ID is required' };
  }

  const trimmed = upiId.trim();

  if (trimmed.length > 70) {
    return { valid: false, error: 'UPI ID cannot exceed 70 characters' };
  }

  if (!UPI_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid UPI ID format. Use format: username@bankcode (e.g., john@upi)',
    };
  }

  return { valid: true };
};

/**
 * Validate mobile number (Indian format)
 */
export const validateMobileNumber = (mobile) => {
  if (!mobile || typeof mobile !== 'string') {
    return { valid: false, error: 'Mobile number is required' };
  }

  const trimmed = mobile.replace(/\s+/g, '').trim();

  if (!MOBILE_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid mobile number. Please enter a valid 10-digit Indian mobile number',
    };
  }

  // Normalize to 10-digit format
  let normalized = trimmed.replace(/^\+91/, '').replace(/^91/, '');
  if (normalized.length > 10) {
    normalized = normalized.slice(-10);
  }

  return { valid: true, normalized };
};

/**
 * Validate room type
 */
export const validateRoomType = (roomType) => {
  const validTypes = ['individual', 'group'];

  if (!roomType) {
    return { valid: false, error: 'Room type is required' };
  }

  if (!validTypes.includes(roomType.toLowerCase())) {
    return {
      valid: false,
      error: `Room type must be one of: ${validTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Validate QR code file
 */
export const validateQRCodeFile = (file) => {
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than 2MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PNG, JPG, or WebP image',
    };
  }

  return { valid: true };
};

/**
 * Validate payment details object
 */
export const validatePaymentDetails = (paymentDetails) => {
  const errors = [];

  if (!paymentDetails) {
    return { valid: true };
  }

  if (paymentDetails.enabled === false) {
    return { valid: true };
  }

  const hasUpiId = paymentDetails.upiId && paymentDetails.upiId.trim();
  const hasMobileNumber = paymentDetails.mobileNumber && paymentDetails.mobileNumber.trim();
  const hasQRCode = paymentDetails.qrCodeData || paymentDetails.qrCodeUrl;

  // At least one payment method required if enabled
  if (!hasUpiId && !hasMobileNumber && !hasQRCode) {
    errors.push('At least one payment method required (UPI ID, mobile number, or QR code)');
  }

  if (hasUpiId) {
    const upiValidation = validateUpiId(paymentDetails.upiId);
    if (!upiValidation.valid) {
      errors.push(upiValidation.error);
    }
  }

  if (hasMobileNumber) {
    const mobileValidation = validateMobileNumber(paymentDetails.mobileNumber);
    if (!mobileValidation.valid) {
      errors.push(mobileValidation.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Validate payment amount for UPI transfer
 */
export const validatePaymentAmount = (amount) => {
  const MIN_AMOUNT = 1;
  const MAX_AMOUNT = 100000;

  if (!amount && amount !== 0) {
    return { valid: false, error: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount format' };
  }

  if (numAmount < MIN_AMOUNT) {
    return { valid: false, error: `Minimum amount is ₹${MIN_AMOUNT}` };
  }

  if (numAmount > MAX_AMOUNT) {
    return { valid: false, error: `Maximum amount is ₹${MAX_AMOUNT}` };
  }

  return { valid: true, normalized: numAmount };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '').slice(-10);
  return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
};

/**
 * Format UPI ID for display (mask some characters)
 */
export const maskUpiId = (upiId) => {
  if (!upiId) return '';
  const [username, bankcode] = upiId.split('@');
  const masked = username.slice(0, 2) + '*'.repeat(username.length - 7) + username.slice(-2);
  return `${masked}@${bankcode}`;
};
