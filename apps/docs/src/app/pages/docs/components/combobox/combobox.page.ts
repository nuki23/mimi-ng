import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ComboboxAsyncExample } from './examples/combobox-async.example';
import { ComboboxCityExample } from './examples/combobox-city.example';
import { ComboboxCreateExample } from './examples/combobox-create.example';
import { ComboboxCustomExample } from './examples/combobox-custom.example';
import { ComboboxDeclarativeExample } from './examples/combobox-declarative.example';
import { ComboboxMultipleExample } from './examples/combobox-multiple.example';
import { ComboboxOptionsExample } from './examples/combobox-options.example';
import { ComboboxStatesExample } from './examples/combobox-states.example';
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
import declarativeSource from './examples/combobox-declarative.example' with { loader: 'text' };
// @ts-expect-error
import multipleSource from './examples/combobox-multiple.example' with { loader: 'text' };
// @ts-expect-error
import optionsSource from './examples/combobox-options.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/combobox-states.example' with { loader: 'text' };

/** La página de Combobox (G2.8 y R.16), con la plantilla de página (DP.1). */
export const COMBOBOX_PAGE: DocPage = {
  name: 'Combobox',
  lead: 'Campo de texto que filtra una lista mientras escribes, para elegir una o varias opciones, crear valores o buscar en el servidor.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Escribe «mede»: el filtro no distingue tildes ni mayúsculas. «Lima» está deshabilitada.',
    component: ComboboxCityExample,
    source: citySource as string,
  },
  install: 'combobox',
  usage: {
    code: [
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
    ].join('\n'),
    note: 'La misma API que [Select](/docs/components/select). Lo escrito no es el valor hasta que se elige una opción.',
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence: 'Con botón de limpiar, deshabilitado, solo lectura, cargando y con error.',
        component: ComboboxStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'declarative',
        title: 'Grupos y botón de limpiar',
        sentence:
          'Opciones y grupos escritos en la plantilla, también dentro de un `@for`; `clearable` quita el valor desde el sitio del chevron.',
        component: ComboboxDeclarativeExample,
        source: declarativeSource as string,
      },
      {
        id: 'multiple',
        title: 'Múltiple con chips',
        sentence:
          'Enter agrega o quita sin cerrar y Retroceso con el campo vacío quita el último chip. Al salir, se ve el primero y «+N».',
        component: ComboboxMultipleExample,
        source: multipleSource as string,
      },
      {
        id: 'create',
        title: 'Crear un valor nuevo',
        sentence:
          'Con `creatable`, si lo escrito no está en la lista, aparece «Crear»; tu app recibe `(create)` y agrega la opción.',
        component: ComboboxCreateExample,
        source: createSource as string,
      },
      {
        id: 'async',
        title: 'Búsqueda en el servidor',
        sentence:
          'Con `searchMode="server"` filtra tu servidor al recibir `(searchChange)`. Prueba «sa» (carga) y «Tokio» (sin resultados).',
        component: ComboboxAsyncExample,
        source: asyncSource as string,
      },
    ],
    custom: [
      {
        id: 'custom',
        title: 'Opción propia, class y panelClass',
        sentence:
          'Una plantilla `mimiComboboxOption` cambia cada opción; `class` va a la caja del campo y `panelClass`, al panel.',
        component: ComboboxCustomExample,
        source: customSource as string,
      },
    ],
    alternatives: [
      {
        id: 'options',
        title: 'Alternativa: [options] para listas generadas por código',
        sentence:
          'Si la lista ya la arma tu código, pásala con `[options]`: opciones `{ label, value }` y grupos `{ label, options }`, como en Select.',
        component: ComboboxOptionsExample,
        source: optionsSource as string,
      },
    ],
  },
  forms: 'combobox',
  accessibility: {
    points: [
      'Escribir abre la lista y activa la primera coincidencia; ↓ y ↑ abren y recorren, Enter elige y Escape cierra.',
      'El foco se queda en el campo: la opción activa se anuncia con `aria-activedescendant`, y la cantidad de resultados, en una región de estado.',
      'Al salir, lo escrito sin elegir se descarta y vuelve el texto de la opción elegida; con el campo vacío, se quita el valor.',
      'Con `clearable`, Supr o Retroceso quitan el valor elegido; escribiendo, borran letras.',
      'En el múltiple, la lista es `aria-multiselectable` y cada chip tiene su botón «Quitar …»; el lector anuncia lo que se agrega y se quita.',
      'Nómbralo con un `<label for>`, `aria-label` o `aria-labelledby`.',
    ],
    more: [
      'Alt+↓ abre y Alt+↑ cierra. Con la lista cerrada, Escape vacía el campo.',
      'En el múltiple, Supr con el campo vacío quita todos los chips; Escape cerrado solo vacía lo escrito; al quitar un chip, el foco vuelve al campo. La ayuda de debajo describe al campo.',
      'La X de limpiar se ve con el ratón encima, con el foco dentro o con el panel abierto; en pantallas táctiles, siempre que haya valor.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'T | null · T[]',
        default: 'null',
        description:
          'La opción elegida o, con `multiple`, las elegidas. Con `[(value)]` o un formulario.',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'false',
        description: 'Varias opciones, como chips. Cerrado y sin foco, el primer chip y «+N».',
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
          'Alternativa a `<mimi-option>` para listas armadas por código, con la forma de Select. Si se da, gana.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño: el mismo alto que Input y Button.',
      },
      {
        name: 'clearable',
        type: 'boolean',
        default: 'false',
        description: 'Muestra el botón de limpiar cuando hay un valor.',
      },
      {
        name: 'creatable',
        type: 'boolean',
        default: 'false',
        description:
          'Ofrece «Crear» si lo escrito no coincide con ninguna opción. Emite `(create)`; tu app agrega la opción.',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: 'Spinner en el campo y estado de carga en el panel.',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: 'El valor se ve y se enfoca, pero no se escribe ni abre el panel.',
      },
      {
        name: 'filterWith',
        type: '(option, text) => boolean',
        default: 'sin tildes ni mayúsculas',
        description: "Filtro propio. Solo cuenta con `searchMode='client'`.",
      },
      {
        name: 'searchMode',
        type: "'client' | 'server'",
        default: "'client'",
        description:
          'Dónde se filtra. Con `server`, filtra tu app al recibir `(searchChange)` y el Combobox muestra lo que llega.',
      },
      {
        name: 'compareWith',
        type: '((a, b) => boolean) | string',
        default: 'Object.is',
        description:
          'Compara valores que son objetos: una función o el nombre de un campo (`"id"`).',
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
        description: 'Clases de la caja del campo y del panel, mezcladas con `cn()`.',
      },
    ],
    outputs: [
      { name: 'valueChange', type: 'T | null · T[]', description: 'El valor cambió.' },
      {
        name: 'searchChange',
        type: 'string',
        description: 'Lo que se escribe, para buscar en el servidor.',
      },
      {
        name: 'create',
        type: 'string',
        description: 'Se eligió «Crear»: el texto, sin espacios a los lados.',
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
        name: 'MimiComboboxStart',
        selector: '[mimiComboboxStart]',
        description: 'Un ícono al principio del campo.',
      },
      {
        name: 'MimiComboboxOption',
        selector: 'ng-template[mimiComboboxOption]',
        description: 'Contenido propio de cada opción.',
      },
      {
        name: 'MimiHighlight',
        selector: 'mimi-highlight',
        description: 'Resalta lo escrito en el texto de una opción (de `option-list`).',
      },
    ],
    dataAttributes: ['data-state', 'data-invalid', 'data-disabled', 'data-readonly'],
  },
  texts: [
    {
      constant: 'MIMI_COMBOBOX_TEXT_ES',
      provider: 'provideMimiComboboxText',
      path: 'combobox/combobox-texts',
    },
    {
      constant: 'MIMI_CHIP_TEXT_ES',
      provider: 'provideMimiChipText',
      path: 'chip/chip-texts',
      note: 'múltiple: «Quitar …» y los anuncios',
    },
  ],
  tokens: 'combobox',
};
