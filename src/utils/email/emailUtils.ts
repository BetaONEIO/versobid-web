export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD' 
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