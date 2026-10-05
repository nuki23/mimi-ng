import { type Rule, SchematicsException, schematic } from '@angular-devkit/schematics';
import type { InitOptions } from '../init';

/** Opciones de ng-add: como las de init, pero `icons` puede llegar como texto. */
export interface NgAddOptions extends Omit<InitOptions, 'icons'> {
  icons?: boolean | string;
}

/**
 * Antes de instalar el paquete, `ng add` no conoce este esquema y pasa `--icons=false` y
 * `--icons=true` como texto (tarea 0.1.1-1). Se convierten aquí, porque init vuelve a validar
 * con su esquema booleano.
 */
export function parseIcons(icons: boolean | string | undefined): boolean | undefined {
  if (icons === undefined || typeof icons === 'boolean') return icons;
  if (icons === 'true') return true;
  if (icons === 'false') return false;
  throw new SchematicsException(`--icons acepta true o false (se recibió "${icons}").`);
}

/** `ng add @mimi-ng/cli`: ejecuta init con las mismas opciones. */
export function ngAdd(options: NgAddOptions): Rule {
  const icons = parseIcons(options.icons);
  return schematic<InitOptions>('init', { ...options, icons });
}
