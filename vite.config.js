import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        404: './404.html',
      },
    },
    minify: 'terser',
  },
});
