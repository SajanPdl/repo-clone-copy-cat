
export const formatNepaliCurrency = (amount: number): string => {
  return `रू ${amount.toLocaleString('en-IN')}`;
};

export const convertToNepali = (usdAmount: number): number => {
  // Assuming 1 USD = 133 NPR (approximate rate)
  const exchangeRate = 133;
  return usdAmount * exchangeRate;
};

export const formatCurrency = (amount: number, currency: string = 'NPR'): string => {
  switch (currency) {
    case 'NPR':
      return formatNepaliCurrency(amount);
    case 'USD':
      return `$${amount.toFixed(2)}`;
    default:
      return `${amount.toFixed(2)}`;
  }
};
