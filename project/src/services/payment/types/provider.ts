export interface PaymentProvider {
  name: string;
  isEnabled: boolean;
  config: PaymentConfig;
}

export interface PaymentConfig {
  currency: string;
  locale: string;
  intent: 'capture' | 'authorize';
  enableFunding: string[];
  disableFunding: string[];
}

export interface PaymentProviderOptions {
  testMode?: boolean;
  debug?: boolean;
  timeout?: number;
  retryAttempts?: number;
}