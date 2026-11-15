import type { DocPage } from '../../../../doc-page/doc-page.types';
import { TabsBasicExample } from './examples/tabs-basic.example';
import { TabsControlledExample } from './examples/tabs-controlled.example';
import { TabsCustomClassExample } from './examples/tabs-custom-class.example';
import { TabsDisabledExample } from './examples/tabs-disabled.example';
import { TabsPillExample } from './examples/tabs-pill.example';
import { TabsPreserveExample } from './examples/tabs-preserve.example';
import { TabsShortcutExample } from './examples/tabs-shortcut.example';
import { TabsSizesExample } from './examples/tabs-sizes.example';
import { TabsVerticalExample } from './examples/tabs-vertical.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/tabs-basic.example' with { loader: 'text' };
// @ts-expect-error
import controlledSource from './examples/tabs-controlled.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/tabs-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import disabledSource from './examples/tabs-disabled.example' with { loader: 'text' };
// @ts-expect-error
import pillSource from './examples/tabs-pill.example' with { loader: 'text' };
// @ts-expect-error
import preserveSource from './examples/tabs-preserve.example' with { loader: 'text' };
// @ts-expect-error
import shortcutSource from './examples/tabs-shortcut.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/tabs-sizes.example' with { loader: 'text' };
// @ts-expect-error
import verticalSource from './examples/tabs-vertical.example' with { loader: 'text' };

/** La página de Tabs (tareas G1.9, B.10 y R.17), con la plantilla de página (DP.2). */
export const TABS_PAGE: DocPage = {
  name: 'Tabs',
  lead: 'Pestañas para pasar entre secciones de un mismo contenido, con un indicador que se desliza a la elegida.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Las secciones de una cuenta, subrayadas y con un contador. Las flechas cambian de pestaña; Inicio y Fin van a la primera y la última.',
    component: TabsBasicExample,
    source: basicSource as string,
  },
  install: 'tabs',
  usage: {
    code: [
      "import { MimiTabsImports } from '@/components/ui/tabs';",
      '',
      '@Component({',
      "  selector: 'app-account',",
      '  imports: [MimiTabsImports],',
      '  template: `',
      '    <mimi-tabs [(value)]="section" aria-label="Secciones de la cuenta">',
      '      <mimi-tab label="Cuenta" value="account">…</mimi-tab>',
      '      <mimi-tab label="Avisos" [count]="3">…</mimi-tab>',
      '      <!-- Un panel costoso: se crea solo al elegir la pestaña. -->',
      '      <ng-template mimiTab="billing" label="Facturación">…</ng-template>',
      '    </mimi-tabs>',
      '  `,',
      '})',
      'export class AccountComponent {',
      "  section = signal('account');",
      '}',
    ].join('\n'),
    note: 'Sin `value`, se elige la primera pestaña habilitada. `<ng-template mimiTab>` crea su panel solo al elegir la pestaña.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm`, `md` y `lg`: la pestaña subrayada mide 36, 44 o 52 px de alto; la píldora, 30, 34 o 40 px.',
        component: TabsSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'pill',
        title: 'Píldora con íconos',
        sentence:
          '`variant="pill"`. Una etiqueta con ícono va en `<ng-template mimiTabLabel>`; si solo tiene ícono, `label` es su nombre accesible.',
        component: TabsPillExample,
        source: pillSource as string,
      },
    ],
    states: [
      {
        id: 'disabled',
        title: 'Deshabilitada',
        sentence: 'Se puede enfocar con las flechas, para que se lea, pero no se elige.',
        component: TabsDisabledExample,
        source: disabledSource as string,
      },
    ],
    advanced: [
      {
        id: 'shortcut',
        title: 'Atajo <mimi-tab label>',
        sentence:
          'El contenido va dentro de `<mimi-tab>`, sin plantilla. Sin `value`, el valor sale del texto: «Avisos» → `avisos`.',
        component: TabsShortcutExample,
        source: shortcutSource as string,
      },
      {
        id: 'controlled',
        title: 'Controlada',
        sentence:
          'El valor se cambia desde fuera con `[(value)]`. Un valor que llega antes que su pestaña se conserva hasta que ella aparece.',
        component: TabsControlledExample,
        source: controlledSource as string,
      },
      {
        id: 'preserve',
        title: 'Contenido conservado',
        sentence:
          '`preserveContent` conserva los paneles al cambiar de pestaña: lo escrito y el scroll siguen ahí al volver.',
        component: TabsPreserveExample,
        source: preserveSource as string,
      },
      {
        id: 'vertical',
        title: 'Vertical',
        sentence:
          'Con `orientation="vertical"`, pestañas en columna, panel al lado y ↑/↓. Aquí cambia en vivo: vertical desde 768 px, horizontal en pantallas chicas.',
        component: TabsVerticalExample,
        source: verticalSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          '`class` va a la fila de pestañas y `panelClass`, a los paneles. Tus clases ganan.',
        component: TabsCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Roles `tablist`, `tab` y `tabpanel`, cada pestaña unida a su panel. Nómbralas con `aria-label` o `aria-labelledby`.',
      'Tab entra a la pestaña elegida y después pasa al panel, también si tiene campos (una parada más).',
      'Las flechas cambian de pestaña, con vuelta: ←/→ en horizontal, ↑/↓ en vertical (`aria-orientation`). Inicio y Fin van a la primera y la última.',
      'Una pestaña deshabilitada se enfoca con las flechas, para que se lea, pero no se elige.',
      'Con movimiento reducido, el indicador cambia sin deslizarse.',
    ],
    more: [
      'Las pestañas tienen el mismo ancho; el indicador se recoloca solo al cambiar el tamaño de la ventana o de la letra. Todavía no admite anchos distintos por pestaña.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'string | undefined',
        default: 'la primera habilitada',
        description: 'La pestaña elegida. Admite `[(value)]`.',
      },
      {
        name: 'variant',
        type: "'underline' | 'pill'",
        default: "'underline'",
        description: 'Subrayada o en píldora.',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description:
          'En vertical, las pestañas a un lado y el panel al otro, con ↑/↓. Puede cambiar en vivo.',
      },
      {
        name: 'preserveContent',
        type: 'boolean',
        default: 'false',
        description:
          'Conserva los paneles al cambiar de pestaña. Sin él, cada panel se destruye al ocultarse.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño, según la escala del tema.',
      },
      {
        name: 'aria-label / aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre de la fila de pestañas.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description:
          'Clases del contenedor de las pestañas, mezcladas con `cn()`: tus clases ganan.',
      },
      { name: 'panelClass', type: 'string', default: "''", description: 'Clases de los paneles.' },
      {
        name: 'mimiTab / value (en la pestaña)',
        type: 'string',
        default: '—',
        description:
          'Valor único de la pestaña. En `<mimi-tab>` es opcional: sin él, sale del `label` en minúsculas y con guiones.',
      },
      {
        name: 'label (en la pestaña)',
        type: 'string',
        default: "''",
        description:
          'El texto de la pestaña. Con una etiqueta de solo ícono, es su nombre accesible.',
      },
      {
        name: 'count (en la pestaña)',
        type: 'number | string',
        default: '—',
        description: 'Contador al lado del texto.',
      },
      {
        name: 'disabled (en la pestaña)',
        type: 'boolean',
        default: 'false',
        description: 'Se puede enfocar con las flechas, pero no elegir.',
      },
    ],
    outputs: [{ name: 'valueChange', type: 'string', description: 'Cambió la pestaña elegida.' }],
    parts: [
      {
        name: 'MimiTabElement',
        selector: 'mimi-tab',
        description: 'Una pestaña con su contenido dentro, que se crea con la página.',
      },
      {
        name: 'MimiTab',
        selector: 'ng-template[mimiTab]',
        description: 'Una pestaña cuyo panel se crea al elegirla.',
      },
      {
        name: 'MimiTabLabel',
        selector: 'ng-template[mimiTabLabel]',
        description: 'Etiqueta propia (con ícono) de la pestaña con ese valor.',
      },
    ],
    dataAttributes: [
      'data-variant',
      'data-orientation',
      'data-size',
      'data-state',
      'data-disabled',
    ],
  },
  tokens: 'tabs',
};
