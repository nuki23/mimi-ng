import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ToggleGroupCustomExample } from './examples/toggle-group-custom.example';
import { ToggleGroupIconsExample } from './examples/toggle-group-icons.example';
import { ToggleGroupMultipleExample } from './examples/toggle-group-multiple.example';
import { ToggleGroupSizesExample } from './examples/toggle-group-sizes.example';
import { ToggleGroupSolidExample } from './examples/toggle-group-solid.example';
import { ToggleGroupStatesExample } from './examples/toggle-group-states.example';
import { ToggleGroupTextExample } from './examples/toggle-group-text.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customSource from './examples/toggle-group-custom.example' with { loader: 'text' };
// @ts-expect-error
import iconsSource from './examples/toggle-group-icons.example' with { loader: 'text' };
// @ts-expect-error
import multipleSource from './examples/toggle-group-multiple.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/toggle-group-sizes.example' with { loader: 'text' };
// @ts-expect-error
import solidSource from './examples/toggle-group-solid.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/toggle-group-states.example' with { loader: 'text' };
// @ts-expect-error
import textSource from './examples/toggle-group-text.example' with { loader: 'text' };

/** La página de Toggle Group (tarea G2.1), con la plantilla de página (DP.2). */
export const TOGGLE_GROUP_PAGE: DocPage = {
  name: 'Toggle Group',
  lead: 'Control segmentado para elegir una opción, como una radio, o varias, como botones de alternancia.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Un periodo con `[(value)]`: una opción a la vez. Las flechas mueven el foco y eligen; el fondo se desliza hasta la elegida.',
    component: ToggleGroupTextExample,
    source: textSource as string,
  },
  install: 'toggle-group',
  usage: {
    code: [
      "import { MimiToggleGroupImports } from '@/components/ui/toggle-group';",
      '',
      '@Component({',
      "  selector: 'app-report',",
      '  imports: [MimiToggleGroupImports],',
      '  template: `',
      '    <mimi-toggle-group aria-label="Periodo" [(value)]="period">',
      '      <button mimiToggleGroupItem="week">Semanal</button>',
      '      <button mimiToggleGroupItem="month">Mensual</button>',
      '    </mimi-toggle-group>',
      '  `,',
      '})',
      'export class ReportComponent {',
      "  period = signal<string | null>('week');",
      '}',
    ].join('\n'),
    note: 'Los botones son tuyos: ponles `mimiToggleGroupItem` con su valor. Los de solo ícono llevan `aria-label`.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence: '`sm`, `md` y `lg` cambian el alto de cada botón (28, 32 y 40 px) y su relleno.',
        component: ToggleGroupSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'solid',
        title: 'Solid',
        sentence:
          '`variant="solid"` pinta los elegidos en `primary`. Aquí, con texto e ícono y selección múltiple.',
        component: ToggleGroupSolidExample,
        source: solidSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado y solo lectura. En solo lectura se ve lo elegido y las flechas mueven el foco, pero el valor no cambia.',
        component: ToggleGroupStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'icons',
        title: 'Solo íconos',
        sentence: 'Cada botón mide 44 px de ancho y su `aria-label` es su nombre.',
        component: ToggleGroupIconsExample,
        source: iconsSource as string,
      },
      {
        id: 'multiple',
        title: 'Selección múltiple',
        sentence: 'Con `multiple`, cada botón se alterna por su cuenta y el valor es `T[]`.',
        component: ToggleGroupMultipleExample,
        source: multipleSource as string,
      },
    ],
    custom: [
      {
        id: 'custom',
        title: 'Personalizar con class',
        sentence: '`class` va al grupo y a cada botón, y gana a las clases de Mimi.',
        component: ToggleGroupCustomExample,
        source: customSource as string,
      },
    ],
  },
  forms: 'toggle-group',
  accessibility: {
    points: [
      'Simple: `role="radiogroup"` con botones `role="radio"`. Una sola parada de Tab (el elegido, o el primero).',
      'En simple, → y ↓ eligen el siguiente y ← y ↑ el anterior, con vuelta. Espacio elige el enfocado.',
      'Múltiple: `role="group"` con botones `aria-pressed`; cada uno es una parada de Tab y se alterna con Enter o Espacio.',
      'Con error lleva `aria-invalid`; en simple, `aria-required` y `aria-readonly` cuando corresponden.',
      'En desarrollo avisa si falta el nombre del grupo, si un botón sin texto no tiene `aria-label` o si el valor no coincide con el modo.',
      'Con movimiento reducido, el indicador salta sin animarse y no hay escala al pulsar.',
    ],
    more: [
      'En derecha a izquierda (`dir="rtl"` en `<html>` o la directiva `Dir`), ← avanza y el indicador se desplaza al revés.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'aria-label / aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre del grupo (obligatorio: en desarrollo avisa si falta).',
      },
      {
        name: 'value',
        type: 'T | null (T[] con multiple)',
        default: 'null',
        description:
          'El elegido o, con `multiple`, los elegidos. Admite `[(value)]` y los formularios. Un valor sin botón se conserva.',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'false',
        description:
          'Varios elegidos a la vez (`aria-pressed`). Sin él, uno solo: volver a pulsar el elegido no lo quita.',
      },
      {
        name: 'variant',
        type: "'default' | 'solid'",
        default: "'default'",
        description: '`solid`: el elegido en `primary`.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño, según la escala del tema.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Deshabilita el grupo entero (también desde el formulario).',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: 'Solo lectura: se ve lo elegido y las flechas mueven el foco, pero no cambia.',
      },
      {
        name: 'invalid, touched, dirty, required',
        type: 'boolean',
        default: 'false',
        description:
          'Los pasa el formulario. Con inválido y tocado o modificado, el grupo lleva `aria-invalid`.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del grupo, mezcladas con `cn()`: tus clases ganan.',
      },
      {
        name: 'mimiToggleGroupItem (en el botón)',
        type: 'unknown',
        default: '—',
        description: 'El valor del botón (único en el grupo). Va en un `<button>`.',
      },
      {
        name: 'class (en el botón)',
        type: 'string',
        default: "''",
        description: 'Clases del botón, mezcladas con `cn()`.',
      },
    ],
    outputs: [
      { name: 'valueChange', type: 'T | null | T[]', description: 'Cambió lo elegido.' },
      {
        name: 'touch',
        type: 'void',
        description:
          'Cuando el foco sale del grupo entero. Lo usa el formulario para marcarlo como tocado.',
      },
    ],
    parts: [
      {
        name: 'MimiToggleGroupItem',
        selector: 'button[mimiToggleGroupItem]',
        description: 'Un botón del grupo, con su valor. El contenido y el `aria-label` son tuyos.',
      },
    ],
    dataAttributes: [
      'data-state',
      'data-variant',
      'data-multiple',
      'data-disabled',
      'data-readonly',
      'data-invalid',
      'data-size',
    ],
  },
  tokens: 'toggleGroup',
};
