/**
 * UPI Integration Utilities
 * Handles UPI deep links and payment app integration
 */

/**
 * Open UPI payment link in default UPI app
 * @param {object} paymentInfo - Payment information
 * @param {string} paymentInfo.upiId - Recipient UPI ID
 * @param {number} paymentInfo.amount - Amount in rupees
 * @param {string} paymentInfo.roomName - Room name (for description)
 * @param {string} paymentInfo.roomId - Room ID (for reference)
 * @param {string} paymentInfo.hostName - Host name (for payee)
 */
export const openUPIApp = ({
  upiId,
  amount,
  roomName = 'Expense Settlement',
  roomId = '',
  hostName = 'Room Host',
}) => {
  try {
    if (!upiId || !amount) {
      throw new Error('UPI ID and amount are required');
    }

    // Construct UPI deep link
    const encodedPayeeName = encodeURIComponent(hostName);
    const encodedDescription = encodeURIComponent(`Settlement - ${roomName}`);
    const transactionRef = roomId;

    const upiLink = `upi://pay?pa=${upiId}&pn=${encodedPayeeName}&am=${amount}&tn=${encodedDescription}&tr=${transactionRef}`;

    // Open in new window/tab
    window.open(upiLink, '_blank');

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Check if UPI is supported (Android/iOS detection)
 */
export const isUPISupported = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod/.test(userAgent);
};

/**
 * Get list of popular UPI apps with their URI schemes
 */
export const getUPIApps = () => {
  return [
    { name: 'Google Pay', scheme: 'googlepay://upi/', id: 'com.google.android.apps.nbu.paisa.user' },
    { name: 'PhonePe', scheme: 'phonepe://upi/', id: 'com.phonepe.app' },
    { name: 'Paytm', scheme: 'paytm://upi/', id: 'net.one97.android' },
    { name: 'BHIM', scheme: 'bhimupi://pay/', id: 'in.org.npci.upiapp' },
    { name: 'WhatsApp', scheme: 'whatsapp://send?phone=', id: 'com.whatsapp' },
  ];
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text, label = 'Text') => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true, message: `${label} copied to clipboard` };
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: true, message: `${label} copied to clipboard` };
    }
  } catch (error) {
    return { success: false, error: 'Failed to copy to clipboard' };
  }
};

/**
 * Convert mobile number to UPI link format
 * Note: Google Pay supports mobile number based UPI
 */
export const getMobileBasedUPILink = (mobileNumber, amount, roomName) => {
  try {
    // Normalize mobile number
    let cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (!cleanMobile.startsWith('91')) {
      cleanMobile = '91' + cleanMobile;
    }

    const encodedDescription = encodeURIComponent(`Settlement - ${roomName}`);
    
    // Google Pay supports mo parameter for mobile numbers
    const link = `upi://pay?mo=${cleanMobile}&am=${amount}&tn=${encodedDescription}`;
    
    return link;
  } catch (error) {
    return null;
  }
};

/**
 * Create WhatsApp share link for payment request
 */
export const createWhatsAppPaymentShare = (
  mobileNumber,
  roomName,
  amount,
  hostName
) => {
  const message = encodeURIComponent(
    `Hi, please send ₹${amount} to ${hostName} for "${roomName}" settlement. ` +
      `You can use UPI, Google Pay, or any payment app. Thanks!`
  );

  return `https://wa.me/${mobileNumber}?text=${message}`;
};

/**
 * Detect if running on mobile device
 */
export const isMobileDevice = () => {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
};

/**
 * Get OS type
 */
export const getOS = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Android')) return 'android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'ios';
  return 'web';
};

/**
 * Format amount with currency
 */
export const formatCurrencyAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
