import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_SELECT_TEXT_ES, provideMimiSelectText } from '@/components/ui/select';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { SelectBasicExample } from './examples/select-basic.example';
import { SelectCustomClassExample } from './examples/select-custom-class.example';
import { SelectGroupsExample } from './examples/select-groups.example';
import { SelectNgModelExample } from './examples/select-ng-model.example';
import { SelectReactiveFormsExample } from './examples/select-reactive-forms.example';
import { SelectSearchExample } from './examples/select-search.example';
import { SelectServerExample } from './examples/select-server.example';
import { SelectSignalFormsExample } from './examples/select-signal-forms.example';
import { SelectStatesExample } from './examples/select-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/select-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/select-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import groupsSource from './examples/select-groups.example' with { loader: 'text' };
// @ts-expect-error
import ngModelSource from './examples/select-ng-model.example' with { loader: 'text' };
// @ts-expect-error
import reactiveFormsSource from './examples/select-reactive-forms.example' with { loader: 'text' };
// @ts-expect-error
import searchSource from './examples/select-search.example' with { loader: 'text' };
// @ts-expect-error
import serverSource from './examples/select-server.example' with { loader: 'text' };
// @ts-expect-error
import signalFormsSource from './examples/select-signal-forms.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/select-states.example' with { loader: 'text' };

/** Documentación de Select (tarea G1.5). */
@Component({
  selector: 'app-select-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    SelectBasicExample,
    SelectCustomClassExample,
    SelectGroupsExample,
    SelectNgModelExample,
    SelectReactiveFormsExample,
    SelectSearchExample,
    SelectServerExample,
    SelectSignalFormsExample,
    SelectStatesExample,
  ],
  // Los textos de Select están en inglés por defecto; este sitio usa el español. Aquí y no en
  // app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiSelectText(MIMI_SELECT_TEXT_ES)],
  templateUrl: './select-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPage {
  protected readonly source = {
    basic: basicSource as string,
    customClass: customClassSource as string,
    groups: groupsSource as string,
    ngModel: ngModelSource as string,
    reactiveForms: reactiveFormsSource as string,
    search: searchSource as string,
    server: serverSource as string,
    signalForms: signalFormsSource as string,
    states: statesSource as string,
  };

  protected readonly usage = [
    "import { type MimiOption, MimiSelect } from '@/components/ui/select';",
    '',
    '@Component({',
    "  selector: 'app-country-field',",
    '  imports: [MimiSelect],',
    '  template: `',
    '    <label for="country">País</label>',
    '    <mimi-select',
    '      id="country"',
    '      placeholder="Selecciona un país"',
    '      search',
    '      clearable',
    '      [(value)]="country"',
    '      [options]="countries"',
    '    />',
    '  `,',
    '})',
    'export class CountryFieldComponent {',
    '  country = signal<string | null>(null);',
    '  countries: MimiOption<string>[] = [',
    "    { label: 'Colombia', value: 'CO' },",
    "    { label: 'México', value: 'MX' },",
    "    { label: 'Perú', value: 'PE', disabled: true, hint: 'Sin cobertura' },",
    '  ];',
    '}',
  ].join('\n');

  protected readonly depsCss = [
    '/* styles.css */',
    '@import "tailwindcss";',
    '@import "./app/components/ui/theme/theme-base.css";',
    '@import "@angular/cdk/overlay-prebuilt.css";',
  ].join('\n');

  protected readonly optionType = [
    'interface MimiOption<T> {',
    '  label: string;',
    '  value: T;',
    '  disabled?: boolean;',
    '  hint?: string; // texto atenuado a la derecha',
    '}',
    '',
    'interface MimiOptionGroup<T> {',
    '  label: string;',
    '  options: MimiOption<T>[];',
    '}',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts',
    "import { MIMI_SELECT_TEXT_ES, provideMimiSelectText } from '@/components/ui/select';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [',
    '    provideMimiSelectText(MIMI_SELECT_TEXT_ES),',
    '    // o solo algunos:',
    "    // provideMimiSelectText({ ...MIMI_SELECT_TEXT_ES, loading: 'Cargando países…' }),",
    '  ],',
    '};',
  ].join('\n');

  protected readonly api = [
    {
      name: 'value',
      type: 'T | null (model)',
      default: 'null',
      description: 'Valor de la opción elegida. Con [(value)] o un formulario.',
    },
    {
      name: 'options',
      type: '(MimiOption<T> | MimiOptionGroup<T>)[]',
      default: '[]',
      description: 'Opciones sueltas, grupos o las dos cosas.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Texto cuando no hay valor.',
    },
    {
      name: 'search',
      type: 'boolean',
      default: 'false',
      description: 'Muestra el buscador dentro del panel.',
    },
    {
      name: 'searchPlaceholder',
      type: 'string',
      default: "''",
      description: 'Placeholder y nombre accesible del buscador. Sin él, el texto «search».',
    },
    {
      name: 'filterWith',
      type: '(option, query) => boolean',
      default: '—',
      description:
        'Filtro propio. Por defecto, la etiqueta contiene la búsqueda, sin tildes ni mayúsculas.',
    },
    {
      name: 'compareWith',
      type: '(a: T, b: T) => boolean',
      default: 'Object.is',
      description: 'Compara el valor con el de cada opción. Úsalo cuando los valores son objetos.',
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'false',
      description: 'Muestra el botón de limpiar cuando hay un valor.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Spinner en el disparador y estado de carga en el panel, en vez de la lista.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'No se puede abrir. Un formulario lo pasa solo.',
    },
    {
      name: 'invalid, touched, dirty, required',
      type: 'boolean',
      default: 'false',
      description:
        'Los pasa el formulario. El error se muestra si es inválido y se tocó o modificó.',
    },
    {
      name: 'id',
      type: 'string',
      default: 'automático',
      description: 'id del disparador, para un <label for> externo.',
    },
    {
      name: 'aria-label, aria-labelledby',
      type: 'string',
      default: '—',
      description: 'Nombre accesible, si no hay una etiqueta visible.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del disparador, mezcladas con cn(): tus clases ganan.',
    },
    {
      name: 'panelClass',
      type: 'string',
      default: "''",
      description: 'Clases del panel.',
    },
  ];

  protected readonly outputs = [
    { name: 'valueChange', type: 'T | null', description: 'El valor cambió.' },
    {
      name: 'searchChange',
      type: 'string',
      description: 'Texto del buscador, para buscar en el servidor. Al cerrar se emite vacío.',
    },
    {
      name: 'touch',
      type: 'void',
      description: 'El foco salió del Select (disparador y panel). Lo usa el formulario.',
    },
  ];
}
