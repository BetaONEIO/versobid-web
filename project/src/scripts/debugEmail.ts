import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { EmailSystemChecker } from '../services/email/debug/emailSystemChecker.js';
import { validateConfig } from '../services/email/debug/utils.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

// Get configuration
const brevoKey = process.env.VITE_BREVO_API_KEY;

async function main() {
  try {
    // Validate configuration
    validateConfig({ brevoApiKey: brevoKey });

    // Initialize and run diagnostics
    const checker = new EmailSystemChecker(brevoKey!);
    await checker.runDiagnostics();
  } catch (error) {
    console.error('\n❌ Email system check failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);