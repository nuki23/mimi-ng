import uiCore from '@mimi-ng/ui-core/package.json';

/** Datos del sitio. Única fuente: no escribir la versión ni la URL en otro lugar. */
export const SITE = {
  /** Versión de Mimi (por ahora, la de ui-core; en la Fase 3 se leerá de @mimi-ng/cli). */
  version: uiCore.version,
  githubUrl: 'https://github.com/nuki23/mimi-ng',
} as const;
