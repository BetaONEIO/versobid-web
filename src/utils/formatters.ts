export const formatCurrency = (amount: number): string => {
  // Handle undefined, null, or invalid numbers
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '£0.00';
  }
  
  // Format the number as GBP currency
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};