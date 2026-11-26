import { InjectionToken, type Provider } from '@angular/core';

/**
 * Cómo se presentan Table y Data Table en el teléfono (por debajo de 640 px, el `sm` de Tailwind,
 * el mismo corte de los paneles; tanda 1 de la 0.9.0):
 *
 * - `stack`: cada fila es una tarjeta con «etiqueta: valor» (la etiqueta es el encabezado de su
 *   columna). Sigue siendo una tabla para el lector de pantalla: lleva los roles `table`, `row`,
 *   `columnheader` y `cell` explícitos (al cambiar el `display` de una tabla, algunos navegadores
 *   le quitan la semántica) y los encabezados, ocultos a la vista, siguen nombrando cada celda.
 * - `scroll`: la tabla de siempre, con scroll lateral y la primera columna fija.
 */
export type MimiTableMobile = 'stack' | 'scroll';

export interface MimiTableConfig {
  /** `<table mimiTable>`. Por defecto, `scroll`. */
  table: MimiTableMobile;
  /** `mimi-data-table`. Por defecto, `stack`. */
  dataTable: MimiTableMobile;
}

export const MIMI_TABLE_CONFIG_DEFAULT: MimiTableConfig = { table: 'scroll', dataTable: 'stack' };

export const MIMI_TABLE_CONFIG = new InjectionToken<MimiTableConfig>('MIMI_TABLE_CONFIG', {
  providedIn: 'root',
  factory: () => MIMI_TABLE_CONFIG_DEFAULT,
});

/**
 * Ajuste global de las tablas en el teléfono: `provideMimiTable({ dataTable: 'scroll' })` en
 * `app.config.ts`. La entrada `mobile` de cada tabla gana.
 */
export function provideMimiTable(config: Partial<MimiTableConfig>): Provider {
  return {
    provide: MIMI_TABLE_CONFIG,
    useValue: { ...MIMI_TABLE_CONFIG_DEFAULT, ...config },
  };
}
