import { availableParallelism } from 'node:os';
import { defineConfig } from 'vitest/config';

/**
 * Concurrencia de las pruebas (M.12, tanda 2 de la 0.7.0). Vitest usa por defecto un worker por
 * núcleo menos uno; con la batería completa (`pnpm test`: docs, ui-core y la CLI seguidas) y la
 * máquina ocupada, las pruebas que renderizan páginas enteras o crean un workspace caducaban por
 * tiempo. En vez de subir más límites de tiempo, se limita la concurrencia: la mitad de los
 * núcleos (como mínimo 2). `MIMI_TEST_WORKERS=<n>` lo cambia (por ejemplo, en CI).
 *
 * La usan `ng test docs` y `ng test ui-core` (`runnerConfig` en `angular.json`; Angular le suma
 * su propia configuración) y la CLI (`packages/cli/vitest.config.mts`).
 */
export function mimiTestWorkers(): number {
  const fromEnv = Number(process.env['MIMI_TEST_WORKERS']);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;
  return Math.max(2, Math.floor(availableParallelism() / 2));
}

export default defineConfig({
  test: {
    maxWorkers: mimiTestWorkers(),
  },
});
