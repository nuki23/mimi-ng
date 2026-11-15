import type { DocPage } from '../../../../doc-page/doc-page.types';
import { DropdownMenuBasicExample } from './examples/dropdown-menu-basic.example';
import { DropdownMenuCheckboxRadioExample } from './examples/dropdown-menu-checkbox-radio.example';
import { DropdownMenuDestructiveExample } from './examples/dropdown-menu-destructive.example';
import { DropdownMenuShortcutsExample } from './examples/dropdown-menu-shortcuts.example';
import { DropdownMenuSizesExample } from './examples/dropdown-menu-sizes.example';
import { DropdownMenuSubmenuExample } from './examples/dropdown-menu-submenu.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/dropdown-menu-basic.example' with { loader: 'text' };
// @ts-expect-error
import checkboxRadioSource from './examples/dropdown-menu-checkbox-radio.example' with {
  loader: 'text',
};
// @ts-expect-error
import destructiveSource from './examples/dropdown-menu-destructive.example' with {
  loader: 'text',
};
// @ts-expect-error
import shortcutsSource from './examples/dropdown-menu-shortcuts.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/dropdown-menu-sizes.example' with { loader: 'text' };
// @ts-expect-error
import submenuSource from './examples/dropdown-menu-submenu.example' with { loader: 'text' };

/** La página de Dropdown Menu (tarea G1.3), con la plantilla de página. */
export const DROPDOWN_MENU_PAGE: DocPage = {
  name: 'Dropdown Menu',
  lead: 'Lista de acciones que se abre desde un botón y se maneja entera con el teclado, con íconos, atajos y submenús.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Ítems con `(selected)` y uno deshabilitado. El `class="w-52"` de `mimi-dropdown-menu` cambia el ancho del panel.',
    component: DropdownMenuBasicExample,
    source: basicSource as string,
  },
  install: 'dropdown-menu',
  usage: {
    code: [
      "import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';",
      '',
      '@Component({',
      "  selector: 'app-project-menu',",
      '  imports: [MimiDropdownMenuImports, MimiButton],',
      '  template: `',
      '    <mimi-dropdown-menu align="start">',
      '      <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Proyecto</button>',
      '      <ng-template mimiDropdownMenuContent>',
      '        <mimi-menu-item shortcut="⌘," (selected)="openSettings()">Ajustes</mimi-menu-item>',
      '        <mimi-menu-separator />',
      '        <mimi-menu-item tone="danger" (selected)="remove()">Eliminar</mimi-menu-item>',
      '      </ng-template>',
      '    </mimi-dropdown-menu>',
      '  `,',
      '})',
      'export class ProjectMenuComponent {}',
    ].join('\n'),
    note: 'Al elegir un ítem, el menú se cierra y el foco vuelve al botón. `shortcut` muestra el atajo, sin registrarlo.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`size` va en `<mimi-dropdown-menu>`: el botón de dentro lo hereda y los ítems miden 28, 32 o 36 px de alto.',
        component: DropdownMenuSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'destructive',
        title: 'Destructivo',
        sentence:
          '`tone="danger"` para acciones que borran algo. El botón solo tiene ícono: lleva `aria-label`, y el menú, el suyo en `<mimi-dropdown-menu>`.',
        component: DropdownMenuDestructiveExample,
        source: destructiveSource as string,
      },
    ],
    advanced: [
      {
        id: 'shortcuts',
        title: 'Con íconos y atajos',
        sentence:
          'El menú «Proyecto» del diseño. Con el menú abierto, escribe una letra para saltar al ítem que empieza por ella.',
        component: DropdownMenuShortcutsExample,
        source: shortcutsSource as string,
      },
      {
        id: 'checkbox-radio',
        title: 'Checkbox y radio',
        sentence:
          'Opciones que se marcan con `[(checked)]` y opciones excluyentes con `[(value)]`, enlazadas a signals.',
        component: DropdownMenuCheckboxRadioExample,
        source: checkboxRadioSource as string,
      },
      {
        id: 'submenu',
        title: 'Submenú',
        sentence:
          'Se abre con el puntero, →, Enter o Espacio; ← o Escape lo cierran. Si no cabe a la derecha, va a la izquierda.',
        component: DropdownMenuSubmenuExample,
        source: submenuSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'El botón lleva `aria-haspopup="menu"`, `aria-expanded` y `aria-controls`. Enter, Espacio o ↓ abren en el primer ítem; ↑, en el último.',
      'En el menú, ↑ y ↓ recorren los ítems (al llegar al final vuelven al principio); Inicio y Fin van a los extremos.',
      'Una letra salta al ítem que empieza por ella.',
      'Enter o Espacio eligen el ítem. Escape cierra y devuelve el foco al botón.',
      'Tab o un clic fuera cierran el menú sin mover el foco.',
      'Los ítems deshabilitados reciben el foco, pero no se pueden elegir.',
    ],
    more: [
      'En un submenú, →, Enter o Espacio lo abren; ← o Escape lo cierran y el foco vuelve a su ítem.',
      'Los ítems llevan `role="menuitem"`, `menuitemcheckbox` o `menuitemradio`; los que se marcan, `aria-checked`.',
      'Si un ítem no es solo texto, `textValue` da el texto para saltar con una letra.',
      'Se abre como popover nativo (en la capa superior), junto al botón en el DOM. Con movimiento reducido, sin animación.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'open',
        type: 'boolean (model)',
        default: 'false',
        description: 'Abierto o cerrado. Admite `[(open)]` para controlarlo desde fuera.',
      },
      {
        name: 'side',
        type: "'top' | 'right' | 'bottom' | 'left'",
        default: "'bottom'",
        description: 'Lado preferido. Si no cabe, pasa al opuesto y después a los otros dos.',
      },
      {
        name: 'align',
        type: "'start' | 'center' | 'end'",
        default: "'start'",
        description: 'Alineación con el botón.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Alto y texto de los ítems; el botón de dentro sin `size` propio lo hereda.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: '—',
        description:
          'Nombre accesible del menú (va al panel). Sin él, lo nombra el texto del botón.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del panel, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [{ name: 'openChange', type: 'boolean', description: 'Se abrió o se cerró.' }],
    parts: [
      {
        name: 'MimiDropdownMenuTrigger',
        selector: '[mimiDropdownMenuTrigger]',
        description: 'El botón que abre y cierra el menú.',
      },
      {
        name: 'MimiDropdownMenuContent',
        selector: 'ng-template[mimiDropdownMenuContent]',
        description: 'Los ítems. Se crean al abrir y se destruyen al cerrar.',
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
    dataAttributes: ['data-state', 'data-tone', 'data-disabled'],
  },
  tokens: 'menu',
};
