import { DiagnosticResult } from '../types';

export async function checkResendConnection(apiKey: string | null): Promise<DiagnosticResult> {
  if (!apiKey) {
    return {
      success: false,
      message: 'Resend API key not configured'
    };
  }

  try {
    const response = await fetch('https://api.resend.com/v1/api-keys', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return {
      success: true,
      message: 'Resend API connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Resend API connection failed',
      error: error as Error
    };
  }
}