import { defineConfig } from 'vitest/config';
import { mimiTestWorkers } from '../../vitest-base.config.mts';

// Pruebas de la CLI: en Node (no jsdom), contra lo compilado en dist/, que es lo que se publica.
// La concurrencia, la misma que docs y ui-core (vitest-base.config.mts, M.12).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    root: import.meta.dirname,
    maxWorkers: mimiTestWorkers(),
  },
});
