import type { Type } from '@angular/core';

/**
 * Los Blocks que se pueden ver en `/preview/blocks/<nombre>` (B.1). Cada Block se carga diferido
 * (no suma a main ni al chunk de la vista previa). `states`: entradas con las que se muestra un
 * estado (`?state=loading`), que la página del Block elige con su selector.
 */
export interface BlockPreview {
  load: () => Promise<Type<unknown>>;
  states?: Record<string, Record<string, unknown>>;
}

export const BLOCK_PREVIEWS: Record<string, BlockPreview> = {};
