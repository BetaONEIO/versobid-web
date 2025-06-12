import React from 'react';

// Performance optimization utilities
export const performanceUtils = {
  // Preload critical resources
  preloadCriticalResources: () => {
    // Preload authentication state from localStorage
    const session = localStorage.getItem('versobid-auth');
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        return parsedSession;
      } catch {
        return null;
      }
    }
    return null;
  },

  // Debounce function for search and input
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Lazy load components
  createLazyComponent: (importFunc: () => Promise<any>) => {
    return React.lazy(importFunc);
  },

  // Session validation without API call
  isSessionValid: (session: any): boolean => {
    if (!session || !session.expires_at) return false;
    const now = Math.floor(Date.now() / 1000);
    return session.expires_at > now;
  },

  // Quick auth state check
  getQuickAuthState: () => {
    const session = performanceUtils.preloadCriticalResources();
    if (!session || !performanceUtils.isSessionValid(session)) {
      return { isAuthenticated: false, user: null };
    }
    
    return {
      isAuthenticated: true,
      user: session.user || null
    };
  },

  // Remove production console logs
  removeConsoleLogs: () => {
    if (import.meta.env.PROD) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  }
};

// Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Remove console logs in production
  performanceUtils.removeConsoleLogs();
} 