import { SchematicsException, type Tree } from '@angular-devkit/schematics';
import { invalidAliasReason } from '../init/paths';

/** Nombre de esta colección (el paquete). */
export const MIMI_COLLECTION = '@mimi-ng/cli';

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Configuración de Mimi en el workspace (spec, sección 5). */
export interface MimiConfig {
  /**
   * Tema: "mimi". La 0.1.0 escribe "vivid", sinónimo que se acepta hasta la 1.0 (spec 12). La CLI no
   * lo lee ni lo valida: cualquier valor se conserva tal cual.
   */
  style?: string;
  tailwind?: { css?: string };
  /**
   * `blocks`: carpeta de los Blocks (B.1). Los proyectos de la 0.3.0 o anteriores no lo tienen:
   * `ng g mimi` usa `defaultBlocksDir` y lo escribe la primera vez que copia un Block.
   */
  aliases?: { components?: string; utils?: string; theme?: string; blocks?: string };
  components?: Record<string, { version: string }>;
  /** Versión de cada Block copiado, como `components`. */
  blocks?: Record<string, { version: string }>;
}

/**
 * Carpeta de los Blocks si mimi.json no la dice: la hermana de `components/` cuando la de
 * componentes es la de siempre (`src/app/components/ui` → `src/app/blocks`), o si no, la hermana
 * de la carpeta de componentes (`src/app/ui` → `src/app/blocks`).
 */
export function defaultBlocksDir(componentsDir: string): string {
  const parts = componentsDir.split('/').filter(Boolean);
  if (parts.length >= 2 && parts.at(-1) === 'ui' && parts.at(-2) === 'components') {
    parts.splice(-2, 2);
  } else {
    parts.pop();
  }
  return [...parts, 'blocks'].join('/');
}

/**
 * M2: falla con un error claro (sin escribir nada) si `aliases.components` o `aliases.blocks` de
 * mimi.json es absoluto, tiene `..` o sale del proyecto.
 */
export function assertAliases(config: MimiConfig): void {
  for (const name of ['components', 'blocks'] as const) {
    const value = config.aliases?.[name];
    if (value === undefined) continue;
    const reason = invalidAliasReason(value);
    if (!reason) continue;
    const example = name === 'blocks' ? 'src/app/blocks' : 'src/app/components/ui';
    throw new SchematicsException(
      `mimi.json → aliases.${name} ${reason}: ${JSON.stringify(value)}. Usa una ruta relativa a ` +
        `la raíz del workspace y dentro de ella (por ejemplo "${example}"). No se cambió nada.`,
    );
  }
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
