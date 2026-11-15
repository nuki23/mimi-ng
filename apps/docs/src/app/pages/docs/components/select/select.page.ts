import type { DocPage } from '../../../../doc-page/doc-page.types';
import { SelectCustomClassExample } from './examples/select-custom-class.example';
import { SelectDemoExample } from './examples/select-demo.example';
import { SelectOptionTemplateExample } from './examples/select-option-template.example';
import { SelectOptionsExample } from './examples/select-options.example';
import { SelectServerExample } from './examples/select-server.example';
import { SelectSizesExample } from './examples/select-sizes.example';
import { SelectStatesExample } from './examples/select-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customClassSource from './examples/select-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import demoSource from './examples/select-demo.example' with { loader: 'text' };
// @ts-expect-error
import optionTemplateSource from './examples/select-option-template.example' with {
  loader: 'text',
};
// @ts-expect-error
import optionsSource from './examples/select-options.example' with { loader: 'text' };
// @ts-expect-error
import serverSource from './examples/select-server.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/select-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/select-states.example' with { loader: 'text' };

/** La página de Select (tarea G1.5), con la plantilla de página (DP.0, piloto). */
export const SELECT_PAGE: DocPage = {
  name: 'Select',
  lead: 'Lista desplegable para elegir una opción, con buscador, grupos, botón de limpiar y estado de carga.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Grupos con `<mimi-optgroup>`, buscador y botón de limpiar. Escribe «mex»: el filtro no distingue tildes ni mayúsculas.',
    component: SelectDemoExample,
    source: demoSource as string,
  },
  install: 'select',
  usage: {
    code: [
      "import { MimiSelectImports } from '@/components/ui/select';",
      '',
      '@Component({',
      "  selector: 'app-country-field',",
      '  imports: [MimiSelectImports],',
      '  template: `',
      '    <mimi-select aria-label="País" placeholder="Elige un país" [(value)]="country">',
      '      <mimi-option value="CO">Colombia</mimi-option>',
      '      <mimi-option value="MX">México</mimi-option>',
      '    </mimi-select>',
      '  `,',
      '})',
      'export class CountryFieldComponent {',
      '  country = signal<string | null>(null);',
      '}',
    ].join('\n'),
    note: 'El texto de cada opción es lo que se ve y `value`, lo que recibes. Para escribir y filtrar, [Combobox](/docs/components/combobox).',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence: '`sm`, `md` y `lg`, con el mismo alto que Input y Button de cada tamaño.',
        component: SelectSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence: 'Con botón de limpiar, deshabilitado, solo lectura, cargando y con error.',
        component: SelectStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'server',
        title: 'Búsqueda en el servidor',
        sentence:
          'Con `searchMode="server"` filtra tu servidor: escucha `(searchChange)`, muestra `loading` mientras llega y compara objetos con `compareWith="id"`.',
        component: SelectServerExample,
        source: serverSource as string,
      },
      {
        id: 'option-template',
        title: 'Contenido propio de la opción',
        sentence:
          'Una plantilla `mimiSelectOption` cambia cada opción, en la lista y en el disparador; `mimi-select-highlight` resalta lo que se busca.',
        component: SelectOptionTemplateExample,
        source: optionTemplateSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          '`class` va al disparador y `panelClass`, al panel. El panel toma el ancho del disparador salvo que le des otro.',
        component: SelectCustomClassExample,
        source: customClassSource as string,
      },
    ],
    alternatives: [
      {
        id: 'options',
        title: 'Alternativa: [options] para listas generadas por código',
        sentence:
          'Si la lista ya la arma tu código, pásala con `[options]`: cada opción es `{ label, value }` y cada grupo, `{ label, options }`.',
        component: SelectOptionsExample,
        source: optionsSource as string,
      },
    ],
  },
  forms: 'select',
  accessibility: {
    points: [
      'Nómbralo con un `<label for>` (que también lo abre), `aria-label` o `aria-labelledby`.',
      'En el disparador, Enter, Espacio, ↓ o ↑ abren el panel en la opción elegida.',
      'En la lista, ↑ y ↓ recorren las opciones habilitadas, Inicio y Fin van a los extremos y una letra salta a la que empieza por ella.',
      'Enter elige y Escape cierra sin cambiar nada; el foco vuelve al disparador. Tab cierra sin elegir.',
      'Con `clearable`, Supr o Retroceso en el disparador quitan el valor.',
      'Con buscador, el foco queda en el campo y la opción activa se anuncia con `aria-activedescendant`.',
    ],
    more: [
      'Alt+↓ también abre el panel, y Alt+↑ elige la opción activa y cierra.',
      'Las flechas vuelven al principio al llegar al final. Las opciones deshabilitadas se saltan; `hint` explica por qué.',
      'La X de limpiar se ve con el ratón encima, con el foco dentro o con el panel abierto; en pantallas táctiles, siempre que haya valor.',
      'El panel se abre como popover nativo (en la capa superior), junto al disparador en el DOM. Con movimiento reducido, sin animación.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'T | null (model)',
        default: 'null',
        description: 'Valor de la opción elegida. Con `[(value)]` o un formulario.',
      },
      {
        name: 'options',
        type: '(MimiOption<T> | MimiOptionGroup<T>)[]',
        default: '[]',
        description:
          'Alternativa a `<mimi-option>` para listas armadas por código. Si se da, gana sobre las `<mimi-option>`.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "''",
        description: 'Texto cuando no hay valor.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño: el mismo alto que Input y Button.',
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
        description: 'Placeholder y nombre accesible del buscador. Sin él, el texto `search`.',
      },
      {
        name: 'filterWith',
        type: '(option, query) => boolean',
        default: '—',
        description:
          'Filtro propio. Por defecto, la etiqueta contiene la búsqueda, sin tildes ni mayúsculas.',
      },
      {
        name: 'searchMode',
        type: "'client' | 'server'",
        default: "'client'",
        description:
          'Dónde se filtra. Con `server`, filtra tu app al recibir `(searchChange)` y el Select muestra lo que llega.',
      },
      {
        name: 'compareWith',
        type: '((a: T, b: T) => boolean) | string',
        default: 'Object.is',
        description:
          'Compara valores que son objetos: una función o el nombre de un campo (`"id"`).',
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
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: 'El valor se ve y se enfoca, pero no cambia ni abre el panel.',
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
        description: '`id` del disparador, para un `<label for>` externo.',
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
        description: 'Clases del disparador, mezcladas con `cn()`: las tuyas ganan.',
      },
      { name: 'panelClass', type: 'string', default: "''", description: 'Clases del panel.' },
      {
        name: 'side',
        type: "'top' | 'right' | 'bottom' | 'left'",
        default: "'bottom'",
        description: 'Lado preferido del panel. Si no cabe, pasa al opuesto.',
      },
      {
        name: 'align',
        type: "'start' | 'center' | 'end'",
        default: "'start'",
        description: 'Alineación del panel con el disparador.',
      },
      {
        name: 'matchWidth',
        type: 'boolean',
        default: 'true',
        description:
          'El panel mide al menos lo que el disparador. Con `false`, lo que pida su contenido.',
      },
    ],
    outputs: [
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
    ],
    parts: [
      {
        name: 'MimiOptionItem',
        selector: 'mimi-option',
        description:
          'Una opción: el texto es la etiqueta; `value`, `hint` y `disabled` son entradas.',
      },
      {
        name: 'MimiOptgroup',
        selector: 'mimi-optgroup',
        description: 'Agrupa opciones bajo su `label`.',
      },
      {
        name: 'MimiSelectOption',
        selector: 'ng-template[mimiSelectOption]',
        description: 'Contenido propio de cada opción, en la lista y en el disparador (`trigger`).',
      },
      {
        name: 'MimiSelectHighlight',
        selector: 'mimi-select-highlight',
        description: 'Resalta en `text` lo que se busca (`query`).',
      },
    ],
    dataAttributes: [
      'data-state',
      'data-invalid',
      'data-disabled',
      'data-readonly',
      'data-placeholder',
    ],
  },
  texts: [{ constant: 'MIMI_SELECT_TEXT_ES', provider: 'provideMimiSelectText', path: 'select' }],
  tokens: 'select',
};
