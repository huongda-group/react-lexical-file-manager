import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-lexical-file-manager': resolve(__dirname, '../src/index.ts')
    },
    conditions: ['development', 'browser', 'module', 'import', 'default']
  }
});
