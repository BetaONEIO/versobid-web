import { DiagnosticResult } from '../types.js';

export async function checkBrevoConnection(apiKey: string): Promise<DiagnosticResult> {
  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': apiKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return {
      success: true,
      message: 'Brevo API connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Brevo API connection failed',
      error: error as Error
    };
  }
}