import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { emailService } from '../services/email/emailService';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

const TEST_EMAIL = 'test@example.com';

async function compareEmails() {
  console.log('\n🔍 Testing both email types...\n');

  try {
    // Test the test email
    console.log('1. Sending test email...');
    await emailService.sendEmail({
      to: TEST_EMAIL,
      subject: 'VersoBid Test Email',
      templateName: 'test',
      params: {
        name: 'Test User',
        timestamp: new Date().toISOString()
      }
    });
    console.log('✓ Test email sent successfully\n');

    // Test the welcome email
    console.log('2. Sending welcome email...');
    await emailService.sendEmail({
      to: TEST_EMAIL,
      subject: 'Welcome to VersoBid!',
      templateName: 'welcome',
      params: {
        name: 'Test User',
        confirmation_link: 'http://localhost:5173/confirm-email'
      }
    });
    console.log('✓ Welcome email sent successfully\n');

  } catch (error) {
    console.error('❌ Error during email tests:', error);
    process.exit(1);
  }
}

compareEmails().catch(console.error);