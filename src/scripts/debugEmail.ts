import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { EmailSystemChecker } from '../services/email/debug/emailSystemChecker';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

// Get configuration
const resendKey = process.env.VITE_RESEND_API_KEY;

async function main() {
  try {
    // Initialize and run diagnostics
    const checker = new EmailSystemChecker(resendKey);
    await checker.runDiagnostics();
  } catch (error) {
    console.error('\n❌ Email system check failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);