import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ToolbarBasicExample } from './examples/toolbar-basic.example';
import { ToolbarFloatingExample } from './examples/toolbar-floating.example';
import { ToolbarToggleExample } from './examples/toolbar-toggle.example';
import { ToolbarTooltipsExample } from './examples/toolbar-tooltips.example';
import { ToolbarVerticalExample } from './examples/toolbar-vertical.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/toolbar-basic.example' with { loader: 'text' };
// @ts-expect-error
import canvasToolsSource from './examples/canvas-tools' with { loader: 'text' };
// @ts-expect-error
import floatingSource from './examples/toolbar-floating.example' with { loader: 'text' };
// @ts-expect-error
import toggleSource from './examples/toolbar-toggle.example' with { loader: 'text' };
// @ts-expect-error
import tooltipsSource from './examples/toolbar-tooltips.example' with { loader: 'text' };
// @ts-expect-error
import verticalSource from './examples/toolbar-vertical.example' with { loader: 'text' };

/** La página de Toolbar (G1.10), con la plantilla de página (DP.1). */
export const TOOLBAR_PAGE: DocPage = {
  name: 'Toolbar',
  lead: 'Barra de herramientas en una píldora, horizontal o vertical: herramienta activa, interruptores, acciones, separadores y contadores.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      '`kind="toggle"` alterna en `[(pressed)]` (fondo gris) y `kind="tool"` elige una sola en `[(value)]` (el disco).',
    component: ToolbarToggleExample,
    source: toggleSource as string,
  },
  install: 'toolbar',
  usage: {
    code: [
      "import { MimiToolbarImports } from '@/components/ui/toolbar';",
      '',
      '@Component({',
      '  imports: [MimiToolbarImports, LucideBold, LucideTextAlignStart],',
      '  template: `',
      '    <mimi-toolbar aria-label="Formato" [(value)]="align" [(pressed)]="styles">',
      '      <button mimiToolbarItem="bold" kind="toggle" aria-label="Negrita">',
      '        <svg lucideBold></svg>',
      '      </button>',
      '      <mimi-toolbar-separator />',
      '      <button mimiToolbarItem="start" kind="tool" aria-label="Alinear al inicio">',
      '        <svg lucideTextAlignStart></svg>',
      '      </button>',
      '    </mimi-toolbar>',
      '  `,',
      '})',
      'export class EditorComponent {',
      "  align = signal('start');",
      '  styles = signal<string[]>([]);',
      '}',
    ].join('\n'),
    note: 'Los botones son tuyos: les pones `mimiToolbarItem` con su valor, el contenido y el `aria-label`.',
  },
  examples: {
    variants: [
      {
        id: 'basic',
        title: 'Acciones',
        sentence:
          'Acciones sueltas: cada clic, Enter o Espacio emite `(activate)` con el valor del botón.',
        component: ToolbarBasicExample,
        source: basicSource as string,
      },
      {
        id: 'vertical',
        title: 'Vertical',
        sentence:
          'Con `orientation="vertical"`, ↑ y ↓ recorren los botones. «Bloquear» está deshabilitado: se enfoca, pero no se activa.',
        component: ToolbarVerticalExample,
        source: verticalSource as string,
      },
    ],
    advanced: [
      {
        id: 'tooltips',
        title: 'Tooltips y contadores',
        sentence:
          'Al pasar de un botón a otro, el tooltip abre sin esperar. El contador es decorativo: el número va también en el `aria-label`.',
        component: ToolbarTooltipsExample,
        source: tooltipsSource as string,
      },
      {
        id: 'floating',
        title: 'Flotante',
        sentence:
          'La toolbar no se posiciona sola: con `class` la pones donde quieras, como en un lienzo. En la vertical, los tooltips van a la derecha.',
        component: ToolbarFloatingExample,
        source: floatingSource as string,
        files: [
          { name: 'toolbar-floating.example.ts', code: floatingSource as string },
          { name: 'canvas-tools.ts', code: canvasToolsSource as string },
        ],
      },
    ],
  },
  accessibility: {
    points: [
      'Una sola parada de Tab: entra al primer botón o al último que usaste. Las flechas recorren los botones, con vuelta; Inicio y Fin van a los extremos.',
      '`role="toolbar"` con `aria-orientation`; las herramientas y los interruptores llevan `aria-pressed`.',
      'Los deshabilitados se enfocan con las flechas, para que se lean, pero el clic no llega a tu `(click)` ni a `(activate)`.',
      'Los botones de solo ícono necesitan `aria-label`; en desarrollo, una toolbar sin nombre avisa en la consola.',
      'Las flechas de un campo o de un menú dentro de la toolbar siguen siendo suyas.',
      'Con movimiento reducido, sin escala al pulsar ni animación del anillo.',
    ],
    more: [
      'Enter y Espacio son los del botón nativo. La herramienta activa no se desmarca al volver a pulsarla.',
      'Si mueves el foco con código, la toolbar sigue desde ahí.',
      'En derecha a izquierda (`dir="rtl"` en `<html>` o la directiva `Dir`), ← avanza. Un `dir` suelto en un contenedor no lo cambia.',
      'Los botones deben estar escritos dentro de `<mimi-toolbar>` (también dentro de un `@if` o un `div`), no en la plantilla de otro componente.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'aria-label / aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre de la toolbar (obligatorio: en desarrollo avisa si falta).',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: 'Dirección de la fila y de las flechas (←→ o ↑↓).',
      },
      {
        name: 'value',
        type: 'string | undefined',
        default: 'undefined',
        description:
          'La herramienta activa (`kind="tool"`), con `[(value)]`. Volver a elegirla no la desmarca.',
      },
      {
        name: 'pressed',
        type: 'string[]',
        default: '[]',
        description: 'Los interruptores presionados (`kind="toggle"`), con `[(pressed)]`.',
      },
      {
        name: 'wrap',
        type: 'boolean',
        default: 'true',
        description: 'Las flechas vuelven al principio desde el último botón.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description:
          'Clases de la píldora, mezcladas con `cn()`: las tuyas ganan (por ejemplo, para posicionarla).',
      },
      {
        name: 'mimiToolbarItem (en el botón)',
        type: 'string',
        default: '—',
        description: 'El valor del botón (único y no vacío). Va en un `<button>`.',
      },
      {
        name: 'kind (en el botón)',
        type: "'tool' | 'toggle' | 'action'",
        default: "'action'",
        description:
          '`tool`: una a la vez (`value`). `toggle`: interruptor (`pressed`). `action`: solo `(activate)`.',
      },
      {
        name: 'disabled (en el botón)',
        type: 'boolean',
        default: 'false',
        description: 'Se enfoca con las flechas, pero no se activa.',
      },
      {
        name: 'class (en el botón)',
        type: 'string',
        default: "''",
        description: 'Clases del botón, mezcladas con `cn()`.',
      },
    ],
    outputs: [
      {
        name: 'activate',
        type: 'string',
        description:
          'El valor del botón en cada activación, después de actualizar `value` o `pressed`. Nunca en un deshabilitado.',
      },
      {
        name: 'valueChange',
        type: 'string | undefined',
        description: 'Cambió la herramienta activa.',
      },
      { name: 'pressedChange', type: 'string[]', description: 'Cambiaron los interruptores.' },
    ],
    parts: [
      {
        name: 'MimiToolbarItem',
        selector: 'button[mimiToolbarItem]',
        description: 'Un botón de la toolbar, con su valor y su `kind`.',
      },
      {
        name: 'MimiToolbarSeparator',
        selector: 'mimi-toolbar-separator',
        description: 'Separa grupos, perpendicular a la toolbar. Acepta `class`.',
      },
      {
        name: 'MimiToolbarCount',
        selector: '[mimiToolbarCount]',
        description: 'El contador sobre un botón (decorativo). Acepta `class`.',
      },
    ],
    dataAttributes: ['data-orientation', 'data-state (en el botón)', 'data-kind', 'data-disabled'],
  },
  tokens: 'toolbar',
};
