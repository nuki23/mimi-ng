import type { DocPage } from '../../../../doc-page/doc-page.types';
import { SheetBasicExample } from './examples/sheet-basic.example';
import { SheetControlledExample } from './examples/sheet-controlled.example';
import { SheetSidesExample } from './examples/sheet-sides.example';
import { SheetSizesExample } from './examples/sheet-sizes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/sheet-basic.example' with { loader: 'text' };
// @ts-expect-error
import controlledSource from './examples/sheet-controlled.example' with { loader: 'text' };
// @ts-expect-error
import sidesSource from './examples/sheet-sides.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/sheet-sizes.example' with { loader: 'text' };

/** La página de Sheet (tarea G4.2), con la plantilla de página. */
export const SHEET_PAGE: DocPage = {
  name: 'Sheet',
  lead: 'Panel modal pegado a un lado de la pantalla, para editar algo o navegar sin salir de la página. Abajo se cierra arrastrando la barra.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Desde la derecha, con título, descripción, un formulario y el pie. Al abrir, el foco pasa al primer campo.',
    component: SheetBasicExample,
    source: basicSource as string,
  },
  install: 'sheet',
  usage: {
    code: [
      "import { MimiSheetImports } from '@/components/ui/sheet';",
      '',
      '@Component({',
      "  selector: 'app-edit-client',",
      '  imports: [MimiSheetImports, MimiButton],',
      '  template: `',
      '    <mimi-sheet side="right">',
      '      <button mimiBtn variant="outline" mimiSheetTrigger>Editar</button>',
      '      <ng-template mimiSheetContent>',
      '        <header mimiSheetHeader><h2 mimiSheetTitle>Editar cliente</h2></header>',
      '        <div mimiSheetBody>…</div>',
      '        <footer mimiSheetFooter><button mimiBtn mimiSheetClose>Guardar</button></footer>',
      '      </ng-template>',
      '    </mimi-sheet>',
      '  `,',
      '})',
      'export class EditClientComponent {}',
    ].join('\n'),
    note: '`class` y `aria-label` van en `<mimi-sheet>` y se aplican a la hoja, la que usan los paneles en el teléfono.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`size` cambia el ancho de la hoja lateral: `sm` (320 px), `md` (384 px, por defecto) y `lg` (512 px).',
        component: SheetSizesExample,
        source: sizesSource as string,
      },
    ],
    advanced: [
      {
        id: 'sides',
        title: 'Lados',
        sentence:
          '`side` elige el borde: `left`, `right` (por defecto) o `bottom`, con una barra de agarre para cerrar arrastrando.',
        component: SheetSidesExample,
        source: sidesSource as string,
      },
      {
        id: 'controlled',
        title: 'Controlado',
        sentence:
          'Con `[(open)]` la abres desde tu código; con `disableClose`, ni Escape ni el fondo la cierran.',
        component: SheetControlledExample,
        source: controlledSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'La hoja es un `role="dialog"` modal (`aria-modal`): el resto de la página queda fuera de Tab y de los lectores.',
      'El botón lleva `aria-haspopup="dialog"` y `aria-expanded`.',
      'Al abrir, el foco va al elemento con `autofocus` o al primero enfocable del contenido; al cerrar, vuelve al botón.',
      'Escape, un toque en el fondo, la X o arrastrar la barra hacia el borde la cierran.',
      'Necesita un nombre: márcalo con `mimiSheetTitle` o usa `aria-label`. En modo desarrollo, avisa si falta.',
      'Con el teclado del móvil abierto, la hoja se achica a la parte visible. Con movimiento reducido, sin animación.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'open',
        type: 'boolean (model)',
        default: 'false',
        description: 'Abierta o cerrada. Admite `[(open)]`.',
      },
      {
        name: 'side',
        type: "'left' | 'right' | 'bottom'",
        default: "'right'",
        description: 'El borde de la pantalla. Abajo lleva barra de agarre.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'El ancho de la hoja lateral: 320, 384 o 512 px.',
      },
      {
        name: 'closeButton',
        type: 'boolean',
        default: 'true',
        description: 'La X arriba a la derecha.',
      },
      {
        name: 'disableClose',
        type: 'boolean',
        default: 'false',
        description: 'Ni Escape, ni el fondo, ni el arrastre la cierran.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: '—',
        description: 'Nombre accesible de la hoja. Con `mimiSheetTitle` no hace falta.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases de la hoja, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [{ name: 'openChange', type: 'boolean', description: 'Se abrió o se cerró.' }],
    parts: [
      {
        name: 'MimiSheet',
        selector: 'mimi-sheet',
        description: 'Contenedor: estado, lado y nombre. Su `class` va a la hoja.',
      },
      {
        name: 'MimiSheetTrigger',
        selector: '[mimiSheetTrigger]',
        description: 'El botón que abre y cierra la hoja.',
      },
      {
        name: 'MimiSheetContent',
        selector: 'ng-template[mimiSheetContent]',
        description: 'El contenido. Se crea al abrir y se destruye al cerrar.',
      },
      {
        name: 'MimiSheetHeader',
        selector: '[mimiSheetHeader]',
        description: 'Cabecera con el título y la descripción.',
      },
      {
        name: 'MimiSheetTitle',
        selector: '[mimiSheetTitle]',
        description: 'Título: el nombre accesible (`aria-labelledby`).',
      },
      {
        name: 'MimiSheetDescription',
        selector: '[mimiSheetDescription]',
        description: 'Texto secundario (`aria-describedby`).',
      },
      {
        name: 'MimiSheetBody',
        selector: '[mimiSheetBody]',
        description: 'El cuerpo, con el relleno del diseño.',
      },
      {
        name: 'MimiSheetFooter',
        selector: '[mimiSheetFooter]',
        description: 'Pie con los botones, abajo.',
      },
      {
        name: 'MimiSheetClose',
        selector: '[mimiSheetClose]',
        description: 'Cierra al hacer clic; el foco vuelve al botón.',
      },
    ],
    dataAttributes: ['data-state', 'data-side', 'data-size'],
  },
  tokens: 'sheet',
};
