import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    dts({
      include: [
        'src/adapters',
        'src/commands',
        'src/hooks',
        'src/nodes',
        'src/plugins',
        'src/types',
        'src/preset.tsx',
        'src/index.ts',
        'src/vite-env.d.ts'
      ],
      tsconfigPath: './tsconfig.build.json'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: [
        'es',
        'cjs'
      ],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs'
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'lexical',
        /^@lexical\//
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          lexical: 'Lexical'
        }
      }
    }
  }
});
