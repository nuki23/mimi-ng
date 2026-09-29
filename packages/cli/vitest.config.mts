import { defineConfig } from 'vitest/config';

// Pruebas de la CLI: en Node (no jsdom), contra lo compilado en dist/, que es lo que se publica.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    root: import.meta.dirname,
  },
});
