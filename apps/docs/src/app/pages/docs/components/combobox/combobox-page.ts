import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_COMBOBOX_TEXT_ES, provideMimiComboboxText } from '@/components/ui/combobox';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ComboboxAsyncExample } from './examples/combobox-async.example';
import { ComboboxCityExample } from './examples/combobox-city.example';
import { ComboboxCreateExample } from './examples/combobox-create.example';
import { ComboboxCustomExample } from './examples/combobox-custom.example';
import { ComboboxFormsExample } from './examples/combobox-forms.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import asyncSource from './examples/combobox-async.example' with { loader: 'text' };
// @ts-expect-error
import citySource from './examples/combobox-city.example' with { loader: 'text' };
// @ts-expect-error
import createSource from './examples/combobox-create.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/combobox-custom.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/combobox-forms.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación del Combobox (tarea G2.8). */
@Component({
  selector: 'app-combobox-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ComboboxCityExample,
    ComboboxCreateExample,
    ComboboxAsyncExample,
    ComboboxFormsExample,
    ComboboxCustomExample,
  ],
  providers: [
    provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './combobox-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxPage {
  protected readonly source = {
    city: citySource as string,
    create: createSource as string,
    async: asyncSource as string,
    forms: formsSource as string,
    custom: customSource as string,
  };

  protected readonly usage = [
    "import { MimiComboboxImports } from '@/components/ui/combobox';",
    "import type { MimiListOption } from '@/components/ui/option-list';",
    '',
    '@Component({',
    '  imports: [MimiComboboxImports],',
    '  template: `<mimi-combobox aria-label="Ciudad" [options]="cities" [(value)]="city" />`,',
    '})',
    'export class TripComponent {',
    '  city = signal<string | null>(null);',
    '  cities: MimiListOption<string>[] = [',
    "    { label: 'Bogotá', value: 'bog' },",
    "    { label: 'Lima', value: 'lim' },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts: el archivo de textos, no el índice.',
    'import {',
    '  MIMI_COMBOBOX_TEXT_ES,',
    '  provideMimiComboboxText,',
    "} from '@/components/ui/combobox/combobox-texts';",
    '',
    'providers: [provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES)]',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: 'T | null',
      default: 'null',
      description:
        'La opción elegida. Admite [(value)], [formField], formControlName y [(ngModel)]. Lo escrito no es el valor hasta que se elige.',
    },
    {
      name: 'options',
      type: '(MimiListOption<T> | MimiListOptionGroup<T>)[]',
      default: '[]',
      description:
        'Opciones sueltas o en grupos, con label, value, disabled y hint (la misma forma que las de Select).',
    },
    {
      name: 'creatable',
      type: 'boolean',
      default: 'false',
      description:
        'Ofrece «Crear "texto"» cuando lo escrito no coincide con ninguna opción. Emite (create); la app agrega la opción y el Combobox la elige.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description:
        'Spinner en el campo y el estado de carga en el panel (búsqueda en el servidor).',
    },
    {
      name: 'filterWith',
      type: '(option, text) => boolean',
      default: 'sin tildes ni mayúsculas',
      description: 'Filtro propio. Con el filtro en el servidor, () => true.',
    },
    {
      name: 'compareWith',
      type: '(a, b) => boolean',
      default: 'Object.is',
      description: 'Compara el valor con el de cada opción (para objetos).',
    },
    {
      name: 'side / align',
      type: "'bottom' | 'top' … / 'start' | 'center' | 'end'",
      default: "'bottom' / 'start'",
      description: 'Lado y alineación del panel, como Popover.',
    },
    {
      name: 'placeholder / disabled / id / aria-label',
      type: '—',
      default: '—',
      description: 'Los del campo de texto.',
    },
    {
      name: 'class / panelClass',
      type: 'string',
      default: "''",
      description: 'Clases de la caja del campo y del panel, mezcladas con cn().',
    },
    {
      name: '(searchChange)',
      type: 'string',
      default: '—',
      description: 'Lo que se escribe, para buscar en el servidor.',
    },
    {
      name: '(create)',
      type: 'string',
      default: '—',
      description: 'Se eligió «Crear»: el texto, sin espacios a los lados.',
    },
  ];
}
