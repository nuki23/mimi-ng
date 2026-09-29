import { SchematicsException, type Tree } from '@angular-devkit/schematics';

/** Nombre de esta colección (el paquete). */
export const MIMI_COLLECTION = '@mimi-ng/cli';

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Configuración de Mimi en el workspace (spec, sección 5). */
export interface MimiConfig {
  style?: string;
  tailwind?: { css?: string };
  aliases?: { components?: string; utils?: string; theme?: string };
  components?: Record<string, { version: string }>;
}

export function readJson<T>(tree: Tree, path: string): T | null {
  if (!tree.exists(path)) return null;
  try {
    return JSON.parse(tree.readText(path)) as T;
  } catch {
    throw new SchematicsException(`${path} no es un JSON válido.`);
  }
}

/** Dependencias y devDependencies juntas. */
export function allDependencies(pkg: PackageJson | null): Record<string, string> {
  return { ...pkg?.devDependencies, ...pkg?.dependencies };
}

/** `^22.1.0`, `~22.0.0`, `>=22`, `22.1.0` → 22. `latest` → null. */
export function majorOf(range: string | undefined): number | null {
  const match = range ? /(\d+)/.exec(range) : null;
  return match ? Number(match[1]) : null;
}
