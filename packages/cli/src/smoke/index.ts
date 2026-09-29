import {
  type Rule,
  SchematicsException,
  apply,
  filter,
  mergeWith,
  move,
  url,
} from '@angular-devkit/schematics';
import { registry, resolveItems } from '../registry';

export interface SmokeOptions {
  item: string;
  path: string;
}

/**
 * Schematic de prueba (oculto): copia un ítem del registro y sus `registryDependencies` desde
 * las plantillas que viajan dentro del paquete (`dist/templates`). Sin red.
 *
 * Todavía no reescribe importaciones ni resuelve archivos existentes: eso es de la tarea 3.3.
 */
export function smoke(options: SmokeOptions): Rule {
  let names: string[];
  try {
    names = resolveItems(options.item);
  } catch (error) {
    throw new SchematicsException((error as Error).message);
  }
  const files = new Set(names.flatMap((name) => registry.items[name].files));

  return mergeWith(
    apply(url('../templates'), [
      // Las rutas del árbol de plantillas empiezan con "/".
      filter((path) => files.has(path.replace(/^\//, ''))),
      move(options.path),
    ]),
  );
}
