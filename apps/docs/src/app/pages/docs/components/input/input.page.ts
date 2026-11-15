import type { DocPage } from '../../../../doc-page/doc-page.types';
import { FieldRowExample } from './examples/field-row.example';
import { InputBasicExample } from './examples/input-basic.example';
import { InputCustomClassExample } from './examples/input-custom-class.example';
import { InputDisabledExample } from './examples/input-disabled.example';
import { InputShowErrorExample } from './examples/input-show-error.example';
import { InputSizesExample } from './examples/input-sizes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import fieldRowSource from './examples/field-row.example' with { loader: 'text' };
// @ts-expect-error
import basicSource from './examples/input-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/input-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import disabledSource from './examples/input-disabled.example' with { loader: 'text' };
// @ts-expect-error
import showErrorSource from './examples/input-show-error.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/input-sizes.example' with { loader: 'text' };

/** La página de Input (tarea 2.2), con la plantilla de página (DP.1). */
export const INPUT_PAGE: DocPage = {
  name: 'Input',
  lead: 'Campo de texto de una línea sobre el `<input>` nativo: funciona con cualquier formulario y se pone en rojo solo cuando hay un error.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Un `<label for>` nombra el campo; el resto es el `<input>` de siempre.',
    component: InputBasicExample,
    source: basicSource as string,
  },
  install: 'input',
  usage: {
    code: [
      "import { MimiInput } from '@/components/ui/input';",
      '',
      '@Component({',
      "  selector: 'app-contact',",
      '  imports: [MimiInput],',
      '  template: `<input mimiInput type="email" placeholder="tu@correo.com" />`,',
      '})',
      'export class ContactComponent {}',
    ].join('\n'),
    note: 'Es una directiva sobre el elemento nativo. Para varias líneas, usa [Textarea](/docs/components/textarea).',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          'Los mismos altos que Button, para que un campo y un botón del mismo tamaño queden alineados.',
        component: InputSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'disabled',
        title: 'Deshabilitado',
        sentence: 'Con `disabled`, el atributo nativo: no se enfoca ni se edita.',
        component: InputDisabledExample,
        source: disabledSource as string,
      },
      {
        id: 'show-error',
        title: 'Error a mano',
        sentence:
          'Con un formulario el error sale solo. Para una validación propia, usa `showError` y escribe el mensaje en `mimi-form-error`.',
        component: InputShowErrorExample,
        source: showErrorSource as string,
      },
    ],
    advanced: [
      {
        id: 'field-row',
        title: 'En fila',
        sentence:
          'Input, Textarea con `rows="1"` y Button miden lo mismo: quedan alineados al píxel.',
        component: FieldRowExample,
        source: fieldRowSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Tus clases se mezclan con las del campo usando `cn()`: si chocan, ganan las tuyas.',
        component: InputCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  forms: 'input',
  accessibility: {
    points: [
      'Es el `<input>` nativo: el teclado, el foco, el autocompletado y el lector funcionan como siempre.',
      'Nómbralo con un `<label for>`, `aria-label` o `aria-labelledby`; dentro de `mimi-form-field`, la etiqueta se enlaza sola.',
      'Con error, lleva `aria-invalid="true"`; el mensaje de `mimi-form-field` va en su `aria-describedby`.',
      'El rojo sale cuando el campo es inválido y ya se tocó o modificó, no al cargar la página.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description:
          'Alto y letra, los de Button. Reemplaza al `size` nativo (el ancho en caracteres): para el ancho, `class`.',
      },
      {
        name: 'showError',
        type: 'boolean | undefined',
        default: 'undefined',
        description:
          '`undefined`: decide el formulario. `true`: muestra el error. `false`: lo oculta aunque sea inválido.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases propias. Se mezclan con `cn()`: las tuyas ganan.',
      },
    ],
    parts: [
      {
        name: 'MimiInput (exportAs)',
        selector: '#campo="mimiInput"',
        description:
          '`fieldState`: `invalid`, `touched`, `dirty`, `disabled` y `showError`, como signals.',
      },
    ],
    dataAttributes: ['data-size', 'data-invalid', 'data-disabled'],
  },
  tokens: 'input',
};
