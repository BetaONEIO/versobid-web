export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getAppUrl = (): string => {
  return window.location.origin;
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const generateEmailParams = (params: Record<string, any>): Record<string, any> => {
  return {
    ...params,
    current_year: getCurrentYear()
  };
};