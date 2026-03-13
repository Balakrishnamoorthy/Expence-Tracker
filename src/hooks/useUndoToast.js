import { useState, useCallback, useRef } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Hook for undo functionality with toast notification
 * Shows a toast with countdown timer and undo button
 */
export const useUndoToast = () => {
  const toast = useToast();
  const timeoutRef = useRef(null);
  const [undoPending, setUndoPending] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(10);

  /**
   * Show undo toast
   * @param {object} options - Configuration options
   * @param {string} options.message - Toast message
   * @param {function} options.onConfirm - Function to call when undo is NOT clicked (after timeout)
   * @param {function} options.onUndo - Function to call when undo IS clicked
   * @param {number} options.duration - Duration in seconds (default: 10)
   */
  const showUndoToast = useCallback(
    ({ message = 'Action completed', onConfirm, onUndo, duration = 10 }) => {
      setUndoPending(true);
      setCountdownSeconds(duration);

      let secondsLeft = duration;

      const handleUndo = async () => {
        // Clear timeout and execute undo
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setUndoPending(false);
        setCountdownSeconds(0);
        
        if (onUndo) {
          try {
            await onUndo();
            toast.success('Action undone');
          } catch (error) {
            toast.error('Failed to undo action');
          }
        }
      };

      const handleConfirm = async () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setUndoPending(false);
        setCountdownSeconds(0);

        if (onConfirm) {
          try {
            await onConfirm();
          } catch (error) {
            toast.error('Action failed');
          }
        }
      };

      // Start countdown
      const countdownInterval = setInterval(() => {
        secondsLeft -= 1;
        setCountdownSeconds(secondsLeft);

        if (secondsLeft <= 0) {
          clearInterval(countdownInterval);
          handleConfirm();
        }
      }, 1000);

      // Show custom toast with undo button
      toast.custom({
        type: 'info',
        message: message,
        action: {
          label: 'Undo',
          onClick: handleUndo,
        },
        countdown: duration,
      });

      // Store timeout for cleanup
      timeoutRef.current = setTimeout(handleConfirm, duration * 1000);
    },
    [toast]
  );

  const clearUndo = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setUndoPending(false);
    setCountdownSeconds(0);
  }, []);

  return {
    showUndoToast,
    clearUndo,
    undoPending,
    countdownSeconds,
  };
};
