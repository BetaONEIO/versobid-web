
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        }
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020'
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      host: 'localhost',
      cors: true,
      allowedHosts: [
        '52e8800c-a685-4197-a774-7c16b49835dd-00-19fuicwr8frnw.spock.replit.dev',
        '.replit.dev',
        '.spock.replit.dev'
      ],
      hmr: {
        clientPort: 5173,
        timeout: 5000,
        host: 'localhost'
      },
      watch: {
        usePolling: true
      }
    },
    preview: {
      port: 5173,
      host: 'localhost'
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    }
  };
});
