import { InjectionToken, type Provider } from '@angular/core';

/*
 * Ajustes y textos de los paneles flotantes en el teléfono (R.34), sin @angular/cdk: así
 * `provideMimiOverlay` y `provideMimiOverlayText` pueden ir en `app.config.ts` sin llevar el
 * overlay al chunk inicial. La hoja está en `utils/sheet.ts`.
 */

/**
 * Cómo se abre el panel de un componente:
 * - `auto` (por defecto): popover desde el punto de corte; por debajo, la presentación móvil del
 *   componente (hoja inferior o pantalla completa).
 * - `popover`: siempre pegado al campo, como en escritorio.
 * - `sheet`: siempre una hoja inferior.
 * - `fullscreen`: siempre a pantalla completa.
 */
export type MimiOverlayPresentation = 'auto' | 'popover' | 'sheet' | 'fullscreen';

/** Lo que resulta de `auto` al abrir: nunca `auto`. */
export type MimiResolvedPresentation = Exclude<MimiOverlayPresentation, 'auto'>;

export interface MimiOverlayConfig {
  /**
   * Ancho (px) por debajo del cual `auto` usa la presentación móvil. 640 (el `sm` de Tailwind)
   * por defecto; `0` la apaga en toda la app.
   */
  mobileBreakpoint: number;
  /** Fuerza una presentación en toda la app (lo que pida un componente con su entrada gana). */
  presentation: MimiOverlayPresentation;
}

export const MIMI_OVERLAY_CONFIG_DEFAULT: MimiOverlayConfig = {
  mobileBreakpoint: 640,
  presentation: 'auto',
};

export const MIMI_OVERLAY_CONFIG = new InjectionToken<MimiOverlayConfig>('MIMI_OVERLAY_CONFIG', {
  providedIn: 'root',
  factory: () => MIMI_OVERLAY_CONFIG_DEFAULT,
});

/**
 * Ajusta el modo móvil de todos los paneles:
 *
 * ```ts
 * provideMimiOverlay({ mobileBreakpoint: 0 }) // siempre popover, como antes de la 0.8.0
 * ```
 */
export function provideMimiOverlay(config: Partial<MimiOverlayConfig>): Provider {
  return {
    provide: MIMI_OVERLAY_CONFIG,
    useValue: { ...MIMI_OVERLAY_CONFIG_DEFAULT, ...config },
  };
}

/** Textos de la hoja (el botón de cerrar y el de volver de un submenú). */
export interface MimiOverlayText {
  /** Nombre accesible del botón de cerrar (la X). */
  close: string;
  /** Nombre accesible del botón de volver (submenús dentro de la hoja). */
  back: string;
}

/** Textos predeterminados (inglés). */
export const MIMI_OVERLAY_TEXT_EN: MimiOverlayText = { close: 'Close', back: 'Back' };

/** Textos en español: `provideMimiOverlayText(MIMI_OVERLAY_TEXT_ES)`. */
export const MIMI_OVERLAY_TEXT_ES: MimiOverlayText = { close: 'Cerrar', back: 'Atrás' };

/** Textos activos. Sin `provideMimiOverlayText`, los predeterminados en inglés. */
export const MIMI_OVERLAY_TEXT = new InjectionToken<MimiOverlayText>('MIMI_OVERLAY_TEXT', {
  providedIn: 'root',
  factory: () => MIMI_OVERLAY_TEXT_EN,
});

/** Cambia los textos de la hoja. Lo que no definas sigue en inglés. */
export function provideMimiOverlayText(text: Partial<MimiOverlayText>): Provider {
  return { provide: MIMI_OVERLAY_TEXT, useValue: { ...MIMI_OVERLAY_TEXT_EN, ...text } };
}

/** Un nivel dentro de la hoja (un submenú): su título y cómo volver al de arriba. */
export interface MimiSheetLevel {
  title: string;
  back: () => void;
}

/**
 * Los niveles de la hoja (R.34): un submenú dentro de la hoja abre un nivel aparte, con «Atrás»
 * y su título en la cabecera. Lo da la hoja (`utils/sheet`); aquí solo el token, sin CDK, para
 * que el menú no traiga la hoja.
 * @internal No forma parte de la API de Mimi.
 */
export interface MimiSheetLevels {
  /** Entra en un nivel (queda arriba de la pila). */
  push(level: MimiSheetLevel): void;
  /** Sale de ese nivel (y de los que tenga encima). */
  remove(level: MimiSheetLevel): void;
}

/** @internal No forma parte de la API de Mimi. */
export const MIMI_SHEET_LEVELS = new InjectionToken<MimiSheetLevels>('MIMI_SHEET_LEVELS');

/**
 * La presentación de verdad al abrir. La pedida gana; con `auto`, la global; con `auto` también,
 * la móvil del componente si la ventana es más angosta que el punto de corte (se mira **al
 * abrir**: no cambia con el panel abierto). Sin `matchMedia` (jsdom), popover.
 */
export function mimiResolvePresentation(
  requested: MimiOverlayPresentation,
  mobile: MimiResolvedPresentation,
  config: MimiOverlayConfig,
  view: (Window & typeof globalThis) | null,
): MimiResolvedPresentation {
  if (requested !== 'auto') return requested;
  if (config.presentation !== 'auto') return config.presentation;
  const breakpoint = config.mobileBreakpoint;
  if (!breakpoint || breakpoint <= 0 || typeof view?.matchMedia !== 'function') return 'popover';
  return view.matchMedia(`(max-width: ${breakpoint - 0.02}px)`).matches ? mobile : 'popover';
}
