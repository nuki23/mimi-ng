import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ContextMenuBasicExample } from './examples/context-menu-basic.example';
import { ContextMenuCheckboxExample } from './examples/context-menu-checkbox.example';
import { ContextMenuDisabledExample } from './examples/context-menu-disabled.example';
import { ContextMenuSizesExample } from './examples/context-menu-sizes.example';
import { ContextMenuSubmenuExample } from './examples/context-menu-submenu.example';
import { ContextMenuTableExample } from './examples/context-menu-table.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/context-menu-basic.example' with { loader: 'text' };
// @ts-expect-error
import checkboxSource from './examples/context-menu-checkbox.example' with { loader: 'text' };
// @ts-expect-error
import disabledSource from './examples/context-menu-disabled.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/context-menu-sizes.example' with { loader: 'text' };
// @ts-expect-error
import submenuSource from './examples/context-menu-submenu.example' with { loader: 'text' };
// @ts-expect-error
import tableSource from './examples/context-menu-table.example' with { loader: 'text' };
// @ts-expect-error
import fileActionsSource from './examples/file-actions-menu' with { loader: 'text' };
// @ts-expect-error
import phoneSource from './examples/context-menu-phone.example' with { loader: 'text' };
import { ContextMenuPhoneExample } from './examples/context-menu-phone.example';

/** La página de Context Menu (tarea G1.4), con la plantilla de página. */
export const CONTEXT_MENU_PAGE: DocPage = {
  name: 'Context Menu',
  lead: 'Menú que aparece con el clic derecho sobre una zona, una lista o una tabla, en el punto del puntero.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Ítems con íconos y atajos, uno deshabilitado y una acción destructiva. Se abre en el punto del clic y, si no cabe, se voltea.',
    component: ContextMenuBasicExample,
    source: basicSource as string,
  },
  install: 'context-menu',
  usage: {
    code: [
      "import { MimiContextMenuImports } from '@/components/ui/context-menu';",
      '',
      '@Component({',
      "  selector: 'app-file-list',",
      '  imports: [MimiContextMenuImports],',
      '  template: `',
      '    <mimi-context-menu aria-label="Acciones del archivo">',
      '      @for (file of files; track file.id) {',
      '        <div mimiContextMenuTrigger [mimiContextMenuTriggerData]="file">{{ file.name }}</div>',
      '      }',
      '      <ng-template mimiContextMenuContent let-file>',
      '        <mimi-menu-item (selected)="rename(file)">Renombrar</mimi-menu-item>',
      '        <mimi-menu-separator />',
      '        <mimi-menu-item tone="danger" (selected)="remove(file)">Eliminar</mimi-menu-item>',
      '      </ng-template>',
      '    </mimi-context-menu>',
      '  `,',
      '})',
      'export class FileListComponent {}',
    ].join('\n'),
    note: 'Usa los mismos ítems que [Dropdown Menu](/docs/components/dropdown-menu). Elegir un ítem o Escape cierra el menú y devuelve el foco.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          'Haz clic derecho en cada zona: `sm`, `md` y `lg` cambian el alto de los ítems y su texto.',
        component: ContextMenuSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'disabled',
        title: 'Desactivado',
        sentence: 'Con `disabled`, el clic derecho muestra el menú del navegador.',
        component: ContextMenuDisabledExample,
        source: disabledSource as string,
      },
    ],
    advanced: [
      {
        id: 'submenu',
        title: 'Con submenú',
        sentence:
          'Con el foco en la zona, Shift+F10 o la tecla de menú abren el menú junto a ella, y → abre el submenú.',
        component: ContextMenuSubmenuExample,
        source: submenuSource as string,
      },
      {
        id: 'checkbox',
        title: 'Con checkbox',
        sentence: '`[(checked)]` enlazado a un signal. Al marcar, el menú se cierra.',
        component: ContextMenuCheckboxExample,
        source: checkboxSource as string,
      },
      {
        id: 'phone',
        title: 'En el teléfono',
        sentence:
          'Debajo de 640 px, al mantener pulsado, el menú sale en una hoja inferior y no en el punto; `presentation="sheet"` la pide aquí.',
        component: ContextMenuPhoneExample,
        source: phoneSource as string,
      },
      {
        id: 'table',
        title: 'Sobre una tabla',
        sentence:
          'Un menú para todas las filas: cada `tr` pasa su archivo con `[mimiContextMenuTriggerData]` y el contenido lo recibe en `let-file`. Cada fila tiene su botón.',
        component: ContextMenuTableExample,
        source: tableSource as string,
        files: [
          { name: 'context-menu-table.example.ts', code: tableSource as string },
          { name: 'file-actions-menu.ts', code: fileActionsSource as string },
        ],
      },
    ],
  },
  accessibility: {
    points: [
      'Con el foco en una zona, Shift+F10 o la tecla de menú abren el menú junto a ella: la zona tiene que poder recibir el foco.',
      'Dentro del menú, el teclado es el de [Dropdown Menu](/docs/components/dropdown-menu): flechas, Inicio y Fin, una letra, Enter, Espacio, → y ←.',
      'Escape o elegir un ítem cierran el menú y devuelven el foco al elemento que lo tenía. Tab o un clic fuera, sin moverlo.',
      'Abierto con el puntero, se cierra al hacer scroll, como el menú del sistema; abierto con el teclado, sigue al elemento.',
      'En Android, la pulsación larga lo abre; en iPhone y iPad sin trackpad, no. Deja las mismas acciones en un botón visible.',
      'Necesita un nombre en `aria-label`: en modo desarrollo, avisa en la consola si falta.',
    ],
    more: [
      'En iPhone y iPad el sistema conserva la pulsación larga para seleccionar texto: el menú contextual es un atajo, no el único camino.',
      'Con el ratón, el foco suele estar en la página (no en la zona) al abrir: al cerrar, vuelve ahí.',
      'Los ítems llevan `role="menuitem"`, `menuitemcheckbox` o `menuitemradio`; los que se marcan, `aria-checked`.',
      'Se abre como popover nativo (en la capa superior). Con movimiento reducido, sin animación.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'presentation',
        type: "'auto' | 'popover' | 'sheet' | 'fullscreen'",
        default: "'auto'",
        description:
          'Cómo se abre. `auto`: hoja inferior debajo de 640 px y junto al punto desde ahí.',
      },
      {
        name: 'sheetTitle',
        type: 'string',
        default: '—',
        description: 'Título de la hoja. Sin él, el `aria-label` del menú.',
      },
      {
        name: 'open',
        type: 'boolean (model)',
        default: 'false',
        description: 'Abierto o cerrado. Abierto desde tu código, va junto al primer trigger.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: '—',
        description:
          'Nombre accesible del menú (va al panel). Hace falta: no hay un botón que lo nombre.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Sin menú propio: el clic derecho muestra el del navegador.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Alto de los ítems (28, 32 o 36 px) y tamaño del texto.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del panel, mezcladas con `cn()`: las tuyas ganan.',
      },
      {
        name: 'mimiContextMenuTriggerData',
        type: 'unknown',
        default: 'undefined',
        description: 'En el trigger: el dato que recibe el contenido (`let-dato`).',
      },
    ],
    outputs: [{ name: 'openChange', type: 'boolean', description: 'Se abrió o se cerró.' }],
    parts: [
      {
        name: 'MimiContextMenuTrigger',
        selector: '[mimiContextMenuTrigger]',
        description:
          'La zona que abre el menú. Puede ir en varios elementos, como cada fila de una tabla.',
      },
      {
        name: 'MimiContextMenuContent',
        selector: 'ng-template[mimiContextMenuContent]',
        description: 'Los ítems. Se crean en cada apertura; `let-dato` recibe el dato del trigger.',
      },
      {
        name: 'MimiMenuItem',
        selector: 'mimi-menu-item',
        description:
          'Una acción: `(selected)` avisa al elegirla. Entradas: `tone`, `shortcut`, `disabled`, `textValue`. Un `svg` va a la columna de íconos.',
      },
      {
        name: 'MimiMenuCheckboxItem',
        selector: 'mimi-menu-checkbox-item',
        description:
          'Opción que se marca o desmarca con `[(checked)]`. También `shortcut`, `disabled` y `textValue`.',
      },
      {
        name: 'MimiMenuRadioGroup',
        selector: 'mimi-menu-radio-group',
        description: 'Opciones excluyentes con `[(value)]`; su nombre, en `aria-label`.',
      },
      {
        name: 'MimiMenuRadioItem',
        selector: 'mimi-menu-radio-item',
        description: 'Una opción del grupo: `value` (obligatorio), `disabled` y `textValue`.',
      },
      {
        name: 'MimiMenuLabel',
        selector: 'mimi-menu-label',
        description: 'Título de un grupo de ítems.',
      },
      {
        name: 'MimiMenuSeparator',
        selector: 'mimi-menu-separator',
        description: 'Línea entre grupos.',
      },
      {
        name: 'MimiMenuSub',
        selector: 'mimi-menu-sub',
        description: 'Submenú: su ítem y su contenido. Su `class` va al panel del submenú.',
      },
      {
        name: 'MimiMenuSubTrigger',
        selector: 'mimi-menu-sub-trigger',
        description: 'El ítem que abre el submenú: `disabled` y `textValue`.',
      },
      {
        name: 'MimiMenuSubContent',
        selector: 'ng-template[mimiMenuSubContent]',
        description: 'Los ítems del submenú.',
      },
    ],
    dataAttributes: ['data-state', 'data-disabled', 'data-tone'],
  },
  tokens: 'menu',
};
