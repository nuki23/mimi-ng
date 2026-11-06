import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DATE_PICKER_TEXT_ES, provideMimiDatePickerText } from '@/components/ui/calendar';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { DateRangeFormsExample } from './examples/date-range-forms.example';
import { DateRangeReportExample } from './examples/date-range-report.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import formsSource from './examples/date-range-forms.example' with { loader: 'text' };
// @ts-expect-error
import reportSource from './examples/date-range-report.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación del Date Range (tarea G2.9b). */
@Component({
  selector: 'app-date-range-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    DateRangeReportExample,
    DateRangeFormsExample,
  ],
  providers: [
    provideMimiDatePickerText(MIMI_DATE_PICKER_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './date-range-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePage {
  protected readonly source = {
    report: reportSource as string,
    forms: formsSource as string,
  };

  protected readonly usage = [
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
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: 'MimiDateRange | null ({ start, end })',
      default: 'null',
      description:
        'El periodo, con fechas ISO y los dos extremos incluidos. Cambia solo cuando están los dos. Admite [(value)], [formField], formControlName y [(ngModel)].',
    },
    {
      name: 'presets',
      type: 'MimiDateRangePreset[] ({ label, range })',
      default: '[]',
      description: 'Atajos de la columna izquierda. Sin atajos, no hay columna.',
    },
    {
      name: 'minDate / maxDate',
      type: 'MimiDate',
      default: '—',
      description: 'Primera y última fecha que se pueden elegir.',
    },
    {
      name: 'isDateDisabled',
      type: '(date: MimiDate) => boolean',
      default: '—',
      description: 'Fechas que no se pueden elegir como inicio o fin.',
    },
    {
      name: 'locale / weekStart / format',
      type: '—',
      default: 'LOCALE_ID',
      description: 'Idioma, primer día de la semana y formato de cada fecha en el botón.',
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
