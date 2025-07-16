
export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export const fetchWithTimeout = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { timeout = 8000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new FetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response
      );
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new FetchError('Request timeout');
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        throw new FetchError('Network error - please check your connection');
      }
    }
    
    throw error;
  }
};

export const safeFetch = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response | null> => {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    console.warn(`Fetch failed for ${url}:`, error instanceof Error ? error.message : error);
    return null;
  }
};
