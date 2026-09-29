import registryJson from './registry.json';

/** Un ítem del registro: un componente, un util o el tema. */
export interface RegistryItem {
  type: 'component' | 'util' | 'theme';
  /** Rutas relativas a las plantillas (`dist/templates`), p. ej. `components/button/button.ts`. */
  files: string[];
  /** Paquetes de npm que se instalan con el ítem, con la versión de ui-core. */
  dependencies?: Record<string, string>;
  /** Paquetes que la app ya debe tener (p. ej. `@angular/forms`). */
  peerDependencies?: Record<string, string>;
  /** Otros ítems del registro que se copian con este. */
  registryDependencies?: string[];
}

export interface Registry {
  version: string;
  items: Record<string, RegistryItem>;
}

export const registry = registryJson as Registry;

/**
 * El ítem y todas sus `registryDependencies`, sin repetir, dependencias primero.
 * Lanza un error si el nombre no existe.
 */
export function resolveItems(name: string, reg: Registry = registry): string[] {
  const ordered: string[] = [];
  const visit = (current: string, trail: string[]) => {
    const item = reg.items[current];
    if (!item) {
      const from = trail.length ? ` (pedido por ${trail[trail.length - 1]})` : '';
      throw new Error(`"${current}" no existe en el registro de Mimi${from}.`);
    }
    if (ordered.includes(current)) return;
    for (const dep of item.registryDependencies ?? []) visit(dep, [...trail, current]);
    ordered.push(current);
  };
  visit(name, []);
  return ordered;
}
