import type { DocPage } from '../../../../doc-page/doc-page.types';
import { CommandDialogExample } from './examples/command-dialog.example';
import { CommandInlineExample } from './examples/command-inline.example';
import { CommandSizesExample } from './examples/command-sizes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import dialogSource from './examples/command-dialog.example' with { loader: 'text' };
// @ts-expect-error
import inlineSource from './examples/command-inline.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/command-sizes.example' with { loader: 'text' };
// @ts-expect-error
import appCommandsSource from './examples/app-commands' with { loader: 'text' };
// @ts-expect-error
import phoneSource from './examples/command-phone.example' with { loader: 'text' };
import { CommandPhoneExample } from './examples/command-phone.example';

/** La página de Command (G3.3), con la plantilla de página (DP). */
export const COMMAND_PAGE: DocPage = {
  name: 'Command',
  lead: 'Paleta de comandos que se abre con ⌘K o Ctrl+K, filtra mientras escribes y ejecuta el elegido con Enter; también va dentro de la página.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      '`mimi-command` es la paleta sola, en la página. Escape vacía lo escrito; `keywords` también encuentra («ocultar»); `mimiCommandEmpty` aparece sin resultados.',
    component: CommandInlineExample,
    source: inlineSource as string,
  },
  install: 'command',
  usage: {
    code: [
      'import {',
      '  MimiCommandImports,',
      '  type MimiCommandGroup,',
      '  type MimiCommandItem,',
      "} from '@/components/ui/command';",
      '',
      '@Component({',
      '  imports: [MimiCommandImports],',
      '  template: `',
      '    <mimi-command-dialog [(open)]="open" [items]="commands" (run)="run($event)" />',
      '  `,',
      '})',
      'export class AppComponent {',
      '  open = signal(false);',
      '  commands: MimiCommandGroup[] = [',
      "    { label: 'Navegación', items: [{ id: 'billing', label: 'Ir a facturación' }] },",
      '  ];',
      '  run(command: MimiCommandItem) { /* command.id, command.data… */ }',
      '}',
    ].join('\n'),
    note: '⌘K (Mac) o Ctrl+K abren y cierran la paleta en toda la página. `mimi-command` es la misma paleta, sin diálogo.',
    more: {
      summary: 'Cada comando: MimiCommandItem',
      items: [
        '`id` y `label` son obligatorios; `label` es lo que se busca y se resalta.',
        '`keywords`: otras palabras con las que se encuentra el comando; no se muestran.',
        "`shortcut`: el atajo de la derecha (`['⌘', 'N']`). Solo se muestra: regístralo tú si lo quieres.",
        '`tone`: el color de la caja del ícono (`info`, `success`, `warning` o `danger`).',
        '`disabled`: se ve pero no se puede ejecutar. `data`: tus datos, para `(run)`.',
        'Un grupo es `{ label, items }`; en `[items]` caben comandos sueltos y grupos.',
      ],
    },
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm`, `md` y `lg` cambian el alto del buscador y de cada comando, y el texto. En el diálogo, igual.',
        component: CommandSizesExample,
        source: sizesSource as string,
      },
    ],
    advanced: [
      {
        id: 'dialog',
        title: 'Diálogo con atajo, íconos y tonos',
        sentence:
          '`mimi-command-dialog` escucha ⌘K o Ctrl+K en toda la página. El ícono va en `<ng-template mimiCommandIcon let-item>`, con el color de `tone`.',
        component: CommandDialogExample,
        source: dialogSource as string,
        files: [
          { name: 'command-dialog.example.ts', code: dialogSource as string },
          { name: 'app-commands.ts', code: appCommandsSource as string },
        ],
      },
      {
        id: 'phone',
        title: 'En el teléfono',
        sentence:
          'Debajo de 640 px el diálogo ocupa la pantalla, con el buscador arriba; `presentation="fullscreen"` lo pide aquí.',
        component: CommandPhoneExample,
        source: phoneSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'El buscador es un combobox siempre abierto con su lista: el foco se queda en el campo y el comando activo se indica con `aria-activedescendant`.',
      '↑ y ↓ mueven el activo (con vuelta), Inicio y Fin van a los extremos, Enter ejecuta. Los comandos deshabilitados se saltan.',
      'Cada grupo tiene su nombre; el número de resultados se anuncia al escribir.',
      'El diálogo encierra el foco, lo lleva al buscador al abrir y lo devuelve al cerrar. Escape lo cierra; en la paleta suelta, vacía lo escrito.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'items',
        type: '(MimiCommandItem | MimiCommandGroup)[]',
        default: '[]',
        description: 'Los comandos, sueltos o en grupos (`{ label, items }`).',
      },
      {
        name: 'open',
        type: 'boolean (model)',
        default: 'false',
        description: 'Solo `mimi-command-dialog`. Abierta o cerrada; admite `[(open)]`.',
      },
      {
        name: 'presentation',
        type: "'auto' | 'popover' | 'sheet' | 'fullscreen'",
        default: "'auto'",
        description:
          'Solo `mimi-command-dialog`. `auto`: pantalla completa debajo de 640 px y centrada desde ahí.',
      },
      {
        name: 'shortcut',
        type: 'string',
        default: "'k'",
        description:
          'Solo `mimi-command-dialog`. Letra que, con ⌘ (Mac) o Ctrl, abre y cierra la paleta. Vacío: sin atajo.',
      },
      {
        name: 'query',
        type: 'string (model)',
        default: "''",
        description: 'Solo `mimi-command`. Lo escrito; admite `[(query)]`.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: '«Type a command or search…»',
        description: 'Texto del buscador vacío.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: '«Command palette»',
        description: 'Nombre del diálogo y de la lista.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "el del contenedor, o 'md'",
        description: 'Tamaño del buscador y de los comandos.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Se mezcla con `cn()`: en `mimi-command`, la paleta; en el diálogo, el panel.',
      },
    ],
    outputs: [
      {
        name: 'run',
        type: 'MimiCommandItem',
        description:
          'Se ejecutó un comando (Enter o clic; los deshabilitados no). El diálogo se cierra antes.',
      },
    ],
    dataAttributes: ['data-state', 'data-size'],
    parts: [
      {
        name: 'MimiCommand',
        selector: 'mimi-command',
        description: 'La paleta sola (buscador, lista y pie), para ponerla dentro de la página.',
      },
      {
        name: 'MimiCommandDialog',
        selector: 'mimi-command-dialog',
        description: 'La paleta en un diálogo, con el atajo ⌘K o Ctrl+K.',
      },
      {
        name: 'MimiCommandIcon',
        selector: 'ng-template[mimiCommandIcon]',
        description:
          'El ícono de cada comando (`let-item`), en su caja de 26px con el color de `tone`.',
      },
      {
        name: 'MimiCommandEmpty',
        selector: '[mimiCommandEmpty]',
        description: 'Lo que va debajo de «sin resultados» (por ejemplo, un botón).',
      },
    ],
  },
  // El archivo concreto: los textos sin la paleta, por si van en app.config.ts.
  texts: [
    {
      constant: 'MIMI_COMMAND_TEXT_ES',
      provider: 'provideMimiCommandText',
      path: 'command/command-texts',
    },
  ],
  tokens: 'command',
};
