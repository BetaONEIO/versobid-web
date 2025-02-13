import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';

// Get current file's directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: resolve(__dirname, '../../.env') });

const TEST_EMAIL = 'tom@betaone.io';
const API_KEY = process.env.VITE_BREVO_API_KEY;

async function sendTestEmail() {
  console.log('Testing email service...');
  console.log(`API Key: ${API_KEY ? '✓ Found' : '✗ Missing'}`);
  console.log(`Recipient: ${TEST_EMAIL}`);

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { 
          email: 'noreply@versobid.com',
          name: 'VersoBid'
        },
        to: [{ email: TEST_EMAIL }],
        subject: 'VersoBid Test Email',
        htmlContent: `
          <h1>Test Email</h1>
          <p>This is a test email from VersoBid.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    console.log('✅ Email sent successfully!', data);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    process.exit(1);
  }
}

sendTestEmail();