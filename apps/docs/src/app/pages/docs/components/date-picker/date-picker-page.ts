import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DATE_PICKER_TEXT_ES, provideMimiDatePickerText } from '@/components/ui/calendar';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { FormsTabs } from '../../../../code/forms-tabs';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { DatePickerCalendarExample } from './examples/date-picker-calendar.example';
import { DatePickerDeliveryExample } from './examples/date-picker-delivery.example';
import { DatePickerFormsExample } from './examples/date-picker-forms.example';
import { DatePickerLocaleExample } from './examples/date-picker-locale.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import calendarSource from './examples/date-picker-calendar.example' with { loader: 'text' };
// @ts-expect-error
import deliverySource from './examples/date-picker-delivery.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/date-picker-forms.example' with { loader: 'text' };
// @ts-expect-error
import localeSource from './examples/date-picker-locale.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación del Date Picker y del calendario (tarea G2.9a). */
@Component({
  selector: 'app-date-picker-page',
  imports: [
    CodeBlock,
    FormsTabs,
    CodePreview,
    CssVariables,
    InstallCommand,
    DatePickerDeliveryExample,
    DatePickerLocaleExample,
    DatePickerFormsExample,
    DatePickerCalendarExample,
  ],
  providers: [
    provideMimiDatePickerText(MIMI_DATE_PICKER_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './date-picker-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerPage {
  protected readonly source = {
    delivery: deliverySource as string,
    locale: localeSource as string,
    forms: formsSource as string,
    calendar: calendarSource as string,
  };

  protected readonly usage = [
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
  ].join('\n');

  protected readonly convert = [
    "import { fromMimiDate, toMimiDate } from '@/components/ui/calendar';",
    '',
    "toMimiDate(new Date());                 // '2026-09-30' (el día local)",
    "toMimiDate(instant, 'America/Lima');   // el día en otra zona horaria",
    "fromMimiDate('2026-09-30');            // Date a medianoche local",
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts: el archivo de textos, no el índice.',
    'import {',
    '  MIMI_DATE_PICKER_TEXT_ES,',
    '  provideMimiDatePickerText,',
    "} from '@/components/ui/calendar/calendar-texts';",
    '',
    'providers: [provideMimiDatePickerText(MIMI_DATE_PICKER_TEXT_ES)]',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: "MimiDate | null ('2026-09-30')",
      default: 'null',
      description:
        'La fecha elegida, como cadena ISO sin hora. Admite [(value)], [formField], formControlName y [(ngModel)].',
    },
    {
      name: 'min / max',
      type: 'MimiDate',
      default: '—',
      description:
        'Primera y última fecha que se pueden elegir. Con [formField] no se pueden enlazar (Signal Forms): usa isDateDisabled.',
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
      description: 'Formato de la fecha en el botón.',
    },
    {
      name: 'placeholder / disabled / id / aria-label',
      type: '—',
      default: '—',
      description: 'Los del botón.',
    },
    {
      name: 'class / panelClass',
      type: 'string',
      default: "''",
      description: 'Clases del botón y del panel, mezcladas con cn().',
    },
  ];
}
