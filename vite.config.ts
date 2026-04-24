import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  // Handle case where VITE_BASE_PATH might be a full URL
  let basePath = env.VITE_BASE_PATH || '/';
  try {
    if (basePath.startsWith('http')) {
      basePath = new URL(basePath).pathname;
    }
  } catch (e) {
    // Fallback to whatever was provided
  }
  
  // Ensure it starts/ends with / if not empty
  if (basePath !== '/' && !basePath.endsWith('/')) {
    basePath += '/';
  }

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
