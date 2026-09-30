// Solo `version`: así el resto del package.json de la CLI no entra al bundle.
import { version } from '@mimi-ng/cli/package.json';

/** Datos del sitio. Única fuente: no escribir la versión ni la URL en otro lugar. */
export const SITE = {
  /** Versión de Mimi: la del package.json de @mimi-ng/cli, única fuente (tarea 3.8). */
  version,
  githubUrl: 'https://github.com/nuki23/mimi-ng',
} as const;
