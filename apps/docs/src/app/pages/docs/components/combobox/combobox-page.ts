import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_CHIP_TEXT_ES, provideMimiChipText } from '@/components/ui/chip';
import { MIMI_COMBOBOX_TEXT_ES, provideMimiComboboxText } from '@/components/ui/combobox';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { FormsTabs } from '../../../../code/forms-tabs';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ComboboxAsyncExample } from './examples/combobox-async.example';
import { ComboboxCityExample } from './examples/combobox-city.example';
import { ComboboxCreateExample } from './examples/combobox-create.example';
import { ComboboxCustomExample } from './examples/combobox-custom.example';
import { ComboboxDeclarativeExample } from './examples/combobox-declarative.example';
import { ComboboxFormsExample } from './examples/combobox-forms.example';
import { ComboboxMultipleExample } from './examples/combobox-multiple.example';
import { ComboboxOptionsExample } from './examples/combobox-options.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import asyncSource from './examples/combobox-async.example' with { loader: 'text' };
// @ts-expect-error
import citySource from './examples/combobox-city.example' with { loader: 'text' };
// @ts-expect-error
import declarativeSource from './examples/combobox-declarative.example' with { loader: 'text' };
// @ts-expect-error
import createSource from './examples/combobox-create.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/combobox-custom.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/combobox-forms.example' with { loader: 'text' };
// @ts-expect-error
import multipleSource from './examples/combobox-multiple.example' with { loader: 'text' };
// @ts-expect-error
import optionsSource from './examples/combobox-options.example' with { loader: 'text' };

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
    FormsTabs,
    CodePreview,
    CssVariables,
    InstallCommand,
    ComboboxCityExample,
    ComboboxMultipleExample,
    ComboboxCreateExample,
    ComboboxAsyncExample,
    ComboboxFormsExample,
    ComboboxCustomExample,
    ComboboxDeclarativeExample,
    ComboboxOptionsExample,
  ],
  providers: [
    provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES),
    provideMimiChipText(MIMI_CHIP_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './combobox-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxPage {
  protected readonly source = {
    city: citySource as string,
    multiple: multipleSource as string,
    create: createSource as string,
    async: asyncSource as string,
    forms: formsSource as string,
    custom: customSource as string,
    declarative: declarativeSource as string,
    options: optionsSource as string,
  };

  protected readonly usage = [
    "import { MimiComboboxImports } from '@/components/ui/combobox';",
    '',
    '@Component({',
    '  imports: [MimiComboboxImports],',
    '  template: `',
    '    <mimi-combobox aria-label="Ciudad" [(value)]="city">',
    '      @for (c of cities(); track c.id) {',
    '        <mimi-option [value]="c.id">{{ c.name }}</mimi-option>',
    '      }',
    '    </mimi-combobox>',
    '  `,',
    '})',
    'export class TripComponent {',
    '  city = signal<string | null>(null);',
    '  cities = signal([',
    "    { id: 'bog', name: 'Bogotá' },",
    "    { id: 'lim', name: 'Lima' },",
    '  ]);',
    '}',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts: el archivo de textos, no el índice.',
    'import {',
    '  MIMI_COMBOBOX_TEXT_ES,',
    '  provideMimiComboboxText,',
    "} from '@/components/ui/combobox/combobox-texts';",
    "import { MIMI_CHIP_TEXT_ES, provideMimiChipText } from '@/components/ui/chip/chip-texts';",
    '',
    'providers: [',
    '  provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES),',
    '  provideMimiChipText(MIMI_CHIP_TEXT_ES), // múltiple: «Quitar …» y los anuncios',
    ']',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: 'T | null · T[]',
      default: 'null',
      description:
        'La opción elegida o, con multiple, las elegidas. Admite [(value)], [formField], formControlName y [(ngModel)]. Lo escrito no es el valor hasta que se elige.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description:
        'Varias opciones, como chips. Enter alterna sin cerrar; Backspace con el campo vacío quita el último; cerrado y sin foco, el primer chip y «+N».',
    },
    {
      name: 'hint',
      type: 'string',
      default: 'la ayuda',
      description: 'Ayuda debajo del campo en el múltiple; vacía, sin ayuda.',
    },
    {
      name: 'options',
      type: '(MimiListOption<T> | MimiListOptionGroup<T>)[]',
      default: '[]',
      description:
        'Alternativa a <mimi-option> para listas armadas por código: opciones sueltas o en grupos, con label, value, disabled y hint (la misma forma que las de Select). Si se da, gana sobre las <mimi-option>.',
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
      description: "Filtro propio. Solo cuenta con searchMode='client'.",
    },
    {
      name: 'searchMode',
      type: "'client' | 'server'",
      default: "'client'",
      description:
        "Dónde se filtra lo que se escribe. Con 'server', tu app filtra al recibir (searchChange) y el Combobox muestra las opciones que llegan, sin volver a filtrarlas.",
    },
    {
      name: 'compareWith',
      type: '((a, b) => boolean) | string',
      default: 'Object.is',
      description:
        'Compara el valor con el de cada opción (para objetos): una función o el nombre de un campo (compareWith="id").',
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
