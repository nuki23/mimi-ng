/** `@import "tailwindcss";` o `@import 'tailwindcss' source(none);`, en su propia línea. */
const TAILWIND_IMPORT = /^[ \t]*@import\s+(["'])tailwindcss\1([^;\n]*);[^\n]*$/m;

export interface TailwindImport {
  /** Posición del final de la línea del import (antes del salto de línea). */
  end: number;
  /** `source(none)`: Tailwind no escanea nada por su cuenta. */
  sourceNone: boolean;
}

export function findTailwindImport(css: string): TailwindImport | null {
  const match = TAILWIND_IMPORT.exec(css);
  if (!match) return null;
  return {
    end: match.index + match[0].length,
    sourceNone: /\bsource\(\s*none\s*\)/.test(match[2]),
  };
}

/** Salto de línea del archivo (respeta CRLF). */
const eolOf = (css: string) => (/\r\n/.test(css) ? '\r\n' : '\n');

/** Inserta líneas justo después del import de Tailwind (que debe existir). */
export function insertAfterTailwind(css: string, lines: string[]): string {
  const found = findTailwindImport(css);
  if (!found || lines.length === 0) return css;
  const eol = eolOf(css);
  const insert = lines.map((line) => eol + line).join('');
  return css.slice(0, found.end) + insert + css.slice(found.end);
}

/** `@import` del tema de Mimi (`…/theme/theme-base.css`), en su propia línea. */
const THEME_IMPORT = /^[ \t]*@import\s+(["'])[^"'\n]*theme-base\.css\1[^;\n]*;[^\n]*$/m;

/**
 * Inserta líneas después del `@import` del tema o, si no está, después del de Tailwind.
 * Devuelve null si no hay ninguno de los dos (no se sabe dónde ponerlas).
 */
export function insertAfterTheme(css: string, lines: string[]): string | null {
  const theme = THEME_IMPORT.exec(css);
  if (!theme) return findTailwindImport(css) ? insertAfterTailwind(css, lines) : null;
  if (lines.length === 0) return css;
  const end = theme.index + theme[0].length;
  const eol = eolOf(css);
  return css.slice(0, end) + lines.map((line) => eol + line).join('') + css.slice(end);
}

/** ¿Ya hay un `@import` o `@source` con esa ruta (con comillas simples o dobles)? */
export function hasDirective(css: string, directive: '@import' | '@source', path: string): boolean {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${directive}\\s+(["'])${escaped}\\1`).test(css);
}
