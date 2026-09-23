import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY': JSON.stringify(
      process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ||
      process.env.VITE_ELEVENLABS_API_KEY ||
      'sk_03dd6960e013a6e5dd3bc5ed50a450effe724db69097a52e'
    ),
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
});
