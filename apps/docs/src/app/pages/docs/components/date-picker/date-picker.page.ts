import type { DocPage } from '../../../../doc-page/doc-page.types';
import { DatePickerCalendarExample } from './examples/date-picker-calendar.example';
import { DatePickerDeliveryExample } from './examples/date-picker-delivery.example';
import { DatePickerLocaleExample } from './examples/date-picker-locale.example';
import { DatePickerStatesExample } from './examples/date-picker-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import calendarSource from './examples/date-picker-calendar.example' with { loader: 'text' };
// @ts-expect-error
import deliverySource from './examples/date-picker-delivery.example' with { loader: 'text' };
// @ts-expect-error
import localeSource from './examples/date-picker-locale.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/date-picker-states.example' with { loader: 'text' };

/** La página del Date Picker y del calendario (tarea G2.9a), con la plantilla de página (DP.2). */
export const DATE_PICKER_PAGE: DocPage = {
  name: 'Date Picker',
  lead: 'Botón con la fecha que abre un calendario, en el idioma de la app y con fechas no disponibles.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Desde hoy y sin fines de semana, con `[min]` e `[isDateDisabled]`. El valor es una fecha ISO.',
    component: DatePickerDeliveryExample,
    source: deliverySource as string,
  },
  install: 'date-picker',
  usage: {
    code: [
      "import { type MimiDate } from '@/components/ui/calendar';",
      "import { MimiDatePicker } from '@/components/ui/date-picker';",
      '',
      '@Component({',
      '  imports: [MimiDatePicker],',
      '  template: `<mimi-date-picker aria-label="Entrega" [(value)]="delivery" />`,',
      '})',
      'export class OrderComponent {',
      "  delivery = signal<MimiDate | null>('2026-09-30');",
      '}',
    ].join('\n'),
    note: "La fecha es una cadena ISO sin hora (`'2026-09-30'`). Para un periodo, [Date Range](/docs/components/date-range).",
    more: {
      summary: 'La fecha ISO y cómo convertirla',
      items: [
        'No cambia de día con la zona horaria, va directo a JSON y se compara como texto.',
        "`toMimiDate(new Date())` da el día local: `'2026-09-30'`.",
        "`toMimiDate(instant, 'America/Lima')` da el día en otra zona horaria.",
        "`fromMimiDate('2026-09-30')` da un `Date` a medianoche local.",
        'Las tres funciones se importan de `@/components/ui/calendar`.',
      ],
    },
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado, solo lectura (se enfoca, pero no abre el calendario) y con error, como lo deja un formulario.',
        component: DatePickerStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'locale',
        title: 'Otro idioma, min y max',
        sentence:
          'Con `locale="en-US"` la semana empieza el domingo; `[format]` cambia el texto del botón y los textos van en inglés.',
        component: DatePickerLocaleExample,
        source: localeSource as string,
      },
      {
        id: 'calendar',
        title: 'Calendario suelto',
        sentence:
          '`<mimi-calendar>` sin panel: el mismo que usan el Date Picker y el Date Range, con `[(value)]`.',
        component: DatePickerCalendarExample,
        source: calendarSource as string,
      },
    ],
  },
  forms: 'date-picker',
  accessibility: {
    points: [
      'Nómbralo con un `<label for>`, `aria-label` o `aria-labelledby`.',
      'El botón abre un diálogo con el foco en la fecha elegida o en hoy; Escape cierra y el foco vuelve al botón.',
      'La cuadrícula es una sola parada de Tab: ← y → mueven un día, ↑ y ↓ una semana.',
      'Inicio y Fin van al principio y al fin de la semana; Re Pág y Av Pág, un mes, y con Mayús, un año. Enter o Espacio eligen.',
      'Cada día se lee completo («30 de septiembre de 2026»); hoy lleva `aria-current="date"`.',
      'Los días no disponibles se anuncian así y reciben el foco, pero no se eligen. El cambio de mes se anuncia.',
    ],
    more: [
      'El botón del título cambia la vista: días, meses y años.',
      'En un documento de derecha a izquierda, ← y → se invierten.',
      'Con `readonly`, el botón se enfoca y lleva `aria-readonly`, pero no abre el calendario.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: "MimiDate | null ('2026-09-30')",
        default: 'null',
        description: 'La fecha elegida, como cadena ISO sin hora. Con `[(value)]` o un formulario.',
      },
      {
        name: 'min, max',
        type: 'MimiDate',
        default: '—',
        description:
          'Primera y última fecha elegibles. Con `[formField]` no se enlazan: usa `isDateDisabled` y valida en el esquema.',
      },
      {
        name: 'isDateDisabled',
        type: '(date: MimiDate) => boolean',
        default: '—',
        description: 'Fechas que no se pueden elegir (fines de semana, feriados).',
      },
      {
        name: 'locale',
        type: 'string',
        default: 'LOCALE_ID',
        description: 'Idioma de los nombres, del formato y del primer día de la semana.',
      },
      {
        name: 'weekStart',
        type: '1 … 7',
        default: 'el del idioma',
        description: 'Primer día de la semana (1 = lunes, 7 = domingo).',
      },
      {
        name: 'format',
        type: 'Intl.DateTimeFormatOptions',
        default: '{ day, month: short, year }',
        description: 'Formato de la fecha en el botón: por defecto, «30 sept 2026».',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "''",
        description: 'Texto del botón cuando no hay fecha.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño del botón y del calendario: el mismo alto que Input.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'No se puede abrir. Un formulario lo pasa solo.',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: 'La fecha se ve y se enfoca, pero no cambia ni abre el calendario.',
      },
      {
        name: 'invalid, touched, dirty, required',
        type: 'boolean',
        default: 'false',
        description:
          'Los pasa el formulario. El error se muestra si es inválido y se tocó o modificó.',
      },
      {
        name: 'id, aria-label, aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Los del botón: `id` para un `<label for>` externo, o el nombre accesible.',
      },
      {
        name: 'class, panelClass',
        type: 'string',
        default: "''",
        description: 'Clases del botón y del panel, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [
      {
        name: 'touch',
        type: 'void',
        description: 'Se cerró el panel: el formulario marca el campo como tocado.',
      },
    ],
    parts: [
      {
        name: 'MimiCalendar',
        selector: 'mimi-calendar',
        description:
          'El calendario suelto: las mismas entradas de fechas e idioma, con `[(value)]` y la salida `(datePick)`.',
      },
    ],
    dataAttributes: ['data-state', 'data-invalid', 'data-disabled', 'data-placeholder'],
  },
  texts: [
    {
      constant: 'MIMI_DATE_PICKER_TEXT_ES',
      provider: 'provideMimiDatePickerText',
      path: 'calendar/calendar-texts',
      note: 'los del calendario, el Date Picker y el Date Range',
    },
  ],
  tokens: 'date',
};
