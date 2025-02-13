export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
) => {
  let timeout: NodeJS.Timeout;

  const debouncedFunc = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
  };

  return debouncedFunc;
};