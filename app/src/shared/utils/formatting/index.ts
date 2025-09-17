export const formatCurrency = (amount?: number) => {
  if (!amount) return 'Price on request';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount);
};
