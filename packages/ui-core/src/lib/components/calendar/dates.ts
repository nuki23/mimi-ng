import { InjectionToken } from '@angular/core';

/*
 * Fechas del calendario, del Date Picker y del Date Range (G2.9; decidido por defecto el
 * 05/11/2026: opción (b), cadena ISO). Una fecha es `'AAAA-MM-DD'`, sin hora ni zona horaria,
 * como el `value` de `<input type="date">`: va directo a JSON y se compara como texto. Por dentro
 * se calcula en UTC, así que ninguna zona horaria corre un día.
 */

/** Una fecha sin hora: `'2026-09-30'`. */
export type MimiDate = string;

/** Un periodo, con los dos extremos incluidos. */
export interface MimiDateRange {
  start: MimiDate;
  end: MimiDate;
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `true` si es una fecha ISO válida (`'2026-02-30'` no lo es). */
export function mimiIsDate(value: unknown): value is MimiDate {
  if (typeof value !== 'string') return false;
  const match = ISO.exec(value);
  if (!match) return false;
  const time = Date.UTC(+match[1], +match[2] - 1, +match[3]);
  return new Date(time).toISOString().slice(0, 10) === value;
}

/**
 * Convierte un `Date` en una fecha de Mimi: el día del calendario de ese instante en la zona
 * horaria local o en `timeZone` (por ejemplo, `'America/Lima'`).
 */
export function toMimiDate(date: Date, timeZone?: string): MimiDate {
  if (!timeZone) {
    return iso(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const part = (type: string) => +(parts.find((p) => p.type === type)?.value ?? 0);
  return iso(part('year'), part('month'), part('day'));
}

/** Convierte una fecha de Mimi en un `Date` a medianoche local (para `DatePipe` y similares). */
export function fromMimiDate(date: MimiDate): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function pad(n: number, size = 2): string {
  return String(n).padStart(size, '0');
}

function iso(year: number, month: number, day: number): MimiDate {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** Milisegundos UTC de la fecha (para calcular sin zona horaria). */
function utc(date: MimiDate): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function fromUtc(time: number): MimiDate {
  return new Date(time).toISOString().slice(0, 10);
}

const DAY = 86_400_000;

/** Suma días (negativos restan). */
export function mimiAddDays(date: MimiDate, days: number): MimiDate {
  return fromUtc(utc(date) + days * DAY);
}

/** Suma meses; si el día no existe en el mes nuevo (31 de abril), queda en el último. */
export function mimiAddMonths(date: MimiDate, months: number): MimiDate {
  const [year, month, day] = date.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0));
  return iso(target.getUTCFullYear(), target.getUTCMonth() + 1, Math.min(day, last.getUTCDate()));
}

/** Días entre dos fechas, contando las dos (del 24 al 30 son 7). */
export function mimiDaysBetween(start: MimiDate, end: MimiDate): number {
  return Math.round((utc(end) - utc(start)) / DAY) + 1;
}

/** Día de la semana ISO: 1 = lunes … 7 = domingo. */
export function mimiWeekday(date: MimiDate): number {
  return new Date(utc(date)).getUTCDay() || 7;
}

/** Primer día del mes de la fecha. */
export function mimiStartOfMonth(date: MimiDate): MimiDate {
  return `${date.slice(0, 7)}-01`;
}

/** Acota una fecha entre `min` y `max` (los dos opcionales). */
export function mimiClampDate(
  date: MimiDate,
  min?: MimiDate | null,
  max?: MimiDate | null,
): MimiDate {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

/** Regiones donde la semana empieza el domingo (respaldo de `Intl.Locale#getWeekInfo`). */
const SUNDAY_FIRST = new Set([
  'US',
  'CA',
  'MX',
  'BR',
  'JP',
  'KR',
  'TW',
  'HK',
  'IL',
  'PH',
  'IN',
  'ZA',
  'SA',
  'PE',
  'CO',
  'VE',
  'GT',
  'HN',
  'SV',
  'NI',
  'PA',
  'DO',
  'PR',
  'PY',
]);

interface WeekInfoLocale {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
  maximize?: () => { region?: string };
  region?: string;
}

/**
 * Primer día de la semana del idioma (1 = lunes … 7 = domingo), con `Intl.Locale#getWeekInfo`
 * (o `weekInfo`) donde existe; si no, por la región del idioma (domingo en las de la lista,
 * lunes en el resto).
 */
export function mimiWeekStart(locale: string): number {
  try {
    const intl = new Intl.Locale(locale) as unknown as WeekInfoLocale;
    const info = intl.getWeekInfo?.() ?? intl.weekInfo;
    if (info?.firstDay) return info.firstDay;
    const region = intl.region ?? intl.maximize?.().region;
    return region && SUNDAY_FIRST.has(region) ? 7 : 1;
  } catch {
    return 1;
  }
}

/** Formatea una fecha con `Intl.DateTimeFormat` (en UTC: no cambia de día con la zona). */
export function mimiFormatDate(
  date: MimiDate,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(utc(date));
}

/**
 * «Hoy» como fecha de Mimi. Por defecto, el día local del navegador; se puede reemplazar (en
 * pruebas o con la zona horaria de la cuenta): `{ provide: MIMI_TODAY, useValue: () => '2026-09-30' }`.
 */
export const MIMI_TODAY = new InjectionToken<() => MimiDate>('MIMI_TODAY', {
  providedIn: 'root',
  factory: () => () => toMimiDate(new Date()),
});
