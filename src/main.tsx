import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateEnv } from './utils/env';

// Environment validation
if (!validateEnv()) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif;">
        <h1 style="color: #EF4444; margin-bottom: 1rem;">Environment Configuration Error</h1>
        <p style="color: #374151;">Please check your environment variables and ensure they are properly configured.</p>
        <div style="margin: 2rem auto; max-width: 600px; text-align: left;">
          <h2 style="color: #1F2937; margin-bottom: 0.5rem;">Required Variables:</h2>
          <pre style="background: #F3F4F6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto;">
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key</pre>
          <p style="color: #4B5563; margin-top: 1rem;">
            Create a <code style="background: #F3F4F6; padding: 0.2rem 0.4rem; border-radius: 0.25rem;">.env</code> 
            file in the project root with these variables.
          </p>
        </div>
      </div>
    `;
  }
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}