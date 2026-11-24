import type { DocPage } from '../../../../doc-page/doc-page.types';
import { DateRangeReportExample } from './examples/date-range-report.example';
import { DateRangeSizesExample } from './examples/date-range-sizes.example';
import { DateRangeStatesExample } from './examples/date-range-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import reportSource from './examples/date-range-report.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/date-range-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/date-range-states.example' with { loader: 'text' };
// @ts-expect-error
import phoneSource from './examples/date-range-phone.example' with { loader: 'text' };
import { DateRangePhoneExample } from './examples/date-range-phone.example';

/** La página del Date Range (tarea G2.9b), con la plantilla de página (DP.2). */
export const DATE_RANGE_PAGE: DocPage = {
  name: 'Date Range',
  lead: 'Campo para elegir un periodo entre dos fechas en un calendario, con atajos opcionales y la cuenta de días.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'El primer clic marca el inicio y el segundo, el fin (si es anterior, se intercambian). Con atajos y sin fechas futuras.',
    component: DateRangeReportExample,
    source: reportSource as string,
  },
  install: 'date-range',
  usage: {
    code: [
      "import { type MimiDateRange } from '@/components/ui/calendar';",
      "import { MimiDateRangePicker } from '@/components/ui/date-range';",
      '',
      '@Component({',
      '  imports: [MimiDateRangePicker],',
      '  template: `<mimi-date-range aria-label="Periodo" [(value)]="period" />`,',
      '})',
      'export class ReportComponent {',
      "  period = signal<MimiDateRange | null>({ start: '2026-09-24', end: '2026-09-30' });",
      '}',
    ].join('\n'),
    note: 'El valor es `{ start, end }`, fechas ISO con los dos extremos incluidos. Para una sola fecha, [Date Picker](/docs/components/date-picker).',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`size` cambia el alto del botón (32, 40 o 48 px; el texto sigue en 14 px) y las celdas del calendario.',
        component: DateRangeSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado, solo lectura (se enfoca, pero no abre el calendario) y con error, como lo deja un formulario.',
        component: DateRangeStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'phone',
        title: 'En el teléfono',
        sentence:
          'Debajo de 640 px, hoja inferior como Date Picker: atajos en una fila deslizable y un mes a lo ancho. `presentation="sheet"` lo pide aquí.',
        component: DateRangePhoneExample,
        source: phoneSource as string,
      },
    ],
  },
  forms: 'date-range',
  accessibility: {
    points: [
      'Nómbralo con un `<label for>`, `aria-label` o `aria-labelledby`.',
      'El teclado del calendario es el del Date Picker; Enter o Espacio marcan el inicio y el fin.',
      'La ayuda de debajo del calendario («Elige el día final.») se anuncia al cambiar.',
      'Los atajos son botones con `aria-pressed`: el del periodo elegido está pulsado.',
      'El botón lee el periodo y, después, la cuenta de días.',
      'Al cerrar con solo el inicio elegido, se descarta y el valor no cambia.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'presentation',
        type: "'auto' | 'popover' | 'sheet' | 'fullscreen'",
        default: "'auto'",
        description: 'Cómo se abre. `auto`: hoja inferior debajo de 640 px y panel desde ahí.',
      },
      {
        name: 'value',
        type: 'MimiDateRange | null ({ start, end })',
        default: 'null',
        description:
          'El periodo, con los dos extremos incluidos. Cambia solo cuando están los dos. Con `[(value)]` o un formulario.',
      },
      {
        name: 'presets',
        type: 'MimiDateRangePreset[] ({ label, range })',
        default: '[]',
        description: 'Atajos de la columna izquierda. Sin atajos, no hay columna.',
      },
      {
        name: 'minDate, maxDate',
        type: 'MimiDate',
        default: '—',
        description:
          'Primera y última fecha elegibles. No se llaman `min` y `max`: en un formulario serían un periodo.',
      },
      {
        name: 'isDateDisabled',
        type: '(date: MimiDate) => boolean',
        default: '—',
        description: 'Fechas que no se pueden elegir como inicio o fin.',
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
        description: 'Formato de cada fecha en el botón.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "''",
        description: 'Texto del botón cuando no hay periodo.',
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
        description: 'El periodo se ve y se enfoca, pero no cambia ni abre el calendario.',
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
