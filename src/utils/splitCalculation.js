/**
 * Split Utilities - Frontend Version
 * Calculation and formatting for split expenses
 */

/**
 * Calculate equal split for all members
 */
export const calculateEqualSplit = (amount, memberIds) => {
  if (!amount || amount <= 0 || !memberIds || memberIds.length === 0) {
    return [];
  }

  const perPersonAmount = parseFloat((amount / memberIds.length).toFixed(2));
  const totalAccounted = perPersonAmount * (memberIds.length - 1);
  const lastPersonAmount = parseFloat((amount - totalAccounted).toFixed(2));

  return memberIds.map((userId, index) => ({
    user: userId,
    amount: index === memberIds.length - 1 ? lastPersonAmount : perPersonAmount,
    settled: false,
  }));
};

/**
 * Validate and normalize custom splits
 */
export const validateAndNormalizeSplits = (amount, splitData) => {
  if (!splitData || splitData.length === 0) {
    return { valid: false, error: 'At least one split required' };
  }

  let total = 0;
  const normalized = splitData.map(split => {
    const amt = parseFloat(split.amount || 0).toFixed(2);
    total += parseFloat(amt);
    return {
      user: split.user,
      amount: parseFloat(amt),
      settled: split.settled || false,
    };
  });

  const expectedTotal = parseFloat(amount).toFixed(2);
  const difference = Math.abs(total - expectedTotal);

  if (difference > 0.01) {
    return {
      valid: false,
      error: `Split total (₹${total.toFixed(2)}) does not match transaction amount (₹${expectedTotal})`,
    };
  }

  return {
    valid: true,
    splits: normalized,
    total: parseFloat(total.toFixed(2)),
  };
};

/**
 * Get split summary for display
 */
export const getSplitSummary = (transaction) => {
  if (!transaction.splits || transaction.splits.length === 0) {
    return {
      totalSplit: 0,
      settled: 0,
      pending: 0,
      percentageSettled: 0,
    };
  }

  const splits = transaction.splits;
  const settled = splits.filter(s => s.settled).length;
  const totalSplit = splits.length;
  const percentageSettled = (settled / totalSplit) * 100;

  return {
    totalSplit,
    settled,
    pending: totalSplit - settled,
    percentageSettled,
  };
};

/**
 * Get member split details
 */
export const getMemberSplits = (transactions, memberId) => {
  const splits = [];

  transactions.forEach(txn => {
    if (!txn.splits) return;

    const memberSplit = txn.splits.find(
      s => (s.user?._id || s.user) === memberId
    );

    if (memberSplit) {
      splits.push({
        transactionId: txn._id,
        roomId: txn.room,
        amount: memberSplit.amount,
        settled: memberSplit.settled,
        category: txn.category,
        description: txn.description,
        date: txn.date,
        addedBy: txn.addedBy?.fullName || 'Unknown',
      });
    }
  });

  return {
    totalAmount: splits.reduce((sum, s) => sum + s.amount, 0),
    settled: splits.filter(s => s.settled).reduce((sum, s) => sum + s.amount, 0),
    pending: splits.filter(s => !s.settled).reduce((sum, s) => sum + s.amount, 0),
    splits,
  };
};

/**
 * Create equal splits from room members
 */
export const createEqualSplitFromRoom = (amount, room) => {
  if (!room || !room.members) return [];

  const allMembers = [room.host._id || room.host, ...room.members.map(m => m.user?._id || m.user)];
  return calculateEqualSplit(amount, allMembers);
};

/**
 * Format split display
 */
export const formatSplitAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};
