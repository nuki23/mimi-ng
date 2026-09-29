import { type Rule, schematic } from '@angular-devkit/schematics';
import type { InitOptions } from '../init';

/** `ng add @mimi-ng/cli`: ejecuta init con las mismas opciones. */
export function ngAdd(options: InitOptions): Rule {
  return schematic('init', options);
}
