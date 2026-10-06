import {
  DOCUMENT,
  type EnvironmentProviders,
  InjectionToken,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import type { MimiComponentTokens, MimiThemePreset } from './types';

/** id del <style> que genera el tema. */
export const MIMI_THEME_STYLE_ID = 'mimi-theme';

/** Preset registrado con provideMimiTheme(). */
export const MIMI_THEME = new InjectionToken<MimiThemePreset>('MIMI_THEME');

/**
 * Selector de cada modo.
 * - light usa :root:not(.dark): con :root a secas le ganaría al .dark de theme-base.css
 *   (misma especificidad, va después) y el modo oscuro tomaría los colores claros.
 * - dark usa .dark: va después de theme-base.css, así que le gana.
 */
const SELECTORS = {
  any: ':root',
  light: ':root:not(.dark)',
  dark: '.dark',
} as const;

type Scope = keyof typeof SELECTORS;
type TokenValue = string | number | undefined;
type TokenGroup = Partial<Record<string, TokenValue>>;

const kebab = (key: string): string => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const RADII: Record<string, string> = {
  sm: 'radius-sm',
  card: 'radius-card',
  badge: 'badge-radius',
};

/** Las sombras van a --mimi-shadow-*, salvo el glow: glowSuccess → --mimi-glow-success. */
const shadowName = (key: string): string =>
  key.startsWith('glow') ? kebab(key) : `shadow-${kebab(key)}`;

/** Alturas → --mimi-control-*; los demás compartidos, sin prefijo: focusRing → --mimi-focus-ring. */
const CONTROL_SIZES = new Set(['height', 'heightSm', 'heightLg']);
const controlName = (key: string): string =>
  CONTROL_SIZES.has(key) ? `control-${kebab(key)}` : kebab(key);

/** Grupos del preset: en qué modo van y cómo se nombra cada variable (sin el prefijo --mimi-). */
const GROUPS: readonly {
  key: keyof MimiThemePreset;
  scope: Scope;
  name: (key: string) => string;
}[] = [
  { key: 'colors', scope: 'light', name: kebab },
  { key: 'darkColors', scope: 'dark', name: kebab },
  { key: 'shadows', scope: 'light', name: shadowName },
  { key: 'darkShadows', scope: 'dark', name: shadowName },
  { key: 'radii', scope: 'any', name: (k) => RADII[k] ?? `radius-${kebab(k)}` },
  { key: 'fonts', scope: 'any', name: (k) => `font-${kebab(k)}` },
  { key: 'motion', scope: 'any', name: kebab },
  { key: 'effects', scope: 'any', name: kebab },
  { key: 'controls', scope: 'any', name: controlName },
];

/** Prefijo de las variables de cada componente: button.fontWeight → --mimi-btn-font-weight. */
const COMPONENT_PREFIX: Record<keyof MimiComponentTokens, string> = {
  button: 'btn',
  input: 'input',
  card: 'card',
  avatar: 'avatar',
  switch: 'switch',
  checkbox: 'checkbox',
  formField: 'field',
  separator: 'separator',
  skeleton: 'skeleton',
  badge: 'badge',
  textarea: 'textarea',
};

/** Nombres de la 0.1.0 que siguen funcionando hasta la 1.0 (spec 12): ruta → qué usar. */
const DEPRECATED: readonly [path: readonly string[], use: string][] = [
  [['components', 'button', 'paddingX'], 'components.button.px'],
  [['components', 'input', 'paddingX'], 'components.input.px'],
  [['components', 'input', 'placeholderColor'], 'la variable --mimi-input-placeholder en tu CSS'],
  [['radii', 'badge'], 'components.badge.radius'],
];
const warnedDeprecated = new Set<string>();

/** En modo desarrollo, avisa una sola vez por cada nombre viejo que use el preset. */
function warnDeprecated(preset: MimiThemePreset): void {
  if (!isDevMode()) return;
  for (const [path, use] of DEPRECATED) {
    const name = path.join('.');
    let value: unknown = preset;
    for (const key of path) value = (value as Record<string, unknown> | undefined)?.[key];
    if (value === undefined || warnedDeprecated.has(name)) continue;
    warnedDeprecated.add(name);
    console.warn(
      `[mimi] ${name} es un nombre de la 0.1.0: usa ${use}. Sigue funcionando hasta la 1.0.`,
    );
  }
}

/** Caracteres que romperían el CSS o cerrarían la etiqueta <style>. */
const UNSAFE_VALUE = /[;{}<]/;

/** Convierte el preset en CSS. Devuelve '' si no hay nada que aplicar. Función pura. */
export function mimiThemeToCss(preset: MimiThemePreset): string {
  const declarations: Record<Scope, string[]> = { any: [], light: [], dark: [] };

  const add = (scope: Scope, name: string, value: TokenValue): void => {
    if (value === undefined) return;
    const text = String(value).trim();
    if (text === '') return;
    if (UNSAFE_VALUE.test(text)) {
      if (isDevMode()) {
        console.warn(`[mimi] Se ignora --mimi-${name}: el valor "${text}" no es seguro.`);
      }
      return;
    }
    declarations[scope].push(`  --mimi-${name}: ${text};`);
  };

  add('any', 'radius', preset.radius);

  for (const group of GROUPS) {
    const tokens = preset[group.key] as TokenGroup | undefined;
    for (const [key, value] of Object.entries(tokens ?? {})) {
      add(group.scope, group.name(key), value);
    }
  }

  const components = preset.components ?? {};
  for (const component of Object.keys(components) as (keyof MimiComponentTokens)[]) {
    const tokens = components[component] as TokenGroup | undefined;
    for (const [key, value] of Object.entries(tokens ?? {})) {
      add('any', `${COMPONENT_PREFIX[component]}-${kebab(key)}`, value);
    }
  }

  const blocks = (Object.keys(SELECTORS) as Scope[])
    .filter((scope) => declarations[scope].length > 0)
    .map((scope) => `${SELECTORS[scope]} {\n${declarations[scope].join('\n')}\n}`);

  // El :root del preset le ganaría al prefers-reduced-motion de theme-base.css.
  const hasMotion = declarations.any.some((d) =>
    /--mimi-(press-scale|press-scale-sm|lift|transition|btn-press-scale):/.test(d),
  );
  if (hasMotion) {
    const btnScale = declarations.any.some((d) => d.startsWith('  --mimi-btn-press-scale:'))
      ? '\n    --mimi-btn-press-scale: 1;'
      : '';
    blocks.push(
      `@media (prefers-reduced-motion: reduce) {\n  :root {\n    --mimi-press-scale: 1;\n    --mimi-press-scale-sm: 1;\n    --mimi-lift: 0;${btnScale}\n  }\n}`,
    );
  }

  return blocks.length > 0 ? `${blocks.join('\n')}\n` : '';
}

/**
 * Aplica el preset en un <style id="mimi-theme"> al final del <head>, después del CSS global,
 * para ganarle a theme-base.css. Reutiliza el <style> si ya existe y lo vuelve a mover al
 * final. Un preset vacío lo elimina. Nunca usa estilos en línea: le ganarían a .dark.
 */
export function applyMimiTheme(
  document: Document,
  preset: MimiThemePreset | null | undefined,
): void {
  const css = mimiThemeToCss(preset ?? {});
  let style = document.getElementById(MIMI_THEME_STYLE_ID);

  if (css === '') {
    style?.remove();
    return;
  }

  if (!style) {
    style = document.createElement('style');
    style.id = MIMI_THEME_STYLE_ID;
  }
  style.textContent = css;
  document.head.appendChild(style);
}

/** Registra un preset del tema. Opcional: sin él, se usa theme-base.css tal cual. */
export function provideMimiTheme(preset: MimiThemePreset): EnvironmentProviders {
  warnDeprecated(preset);
  return makeEnvironmentProviders([
    { provide: MIMI_THEME, useValue: preset },
    provideAppInitializer(() => applyMimiTheme(inject(DOCUMENT), inject(MIMI_THEME))),
  ]);
}
