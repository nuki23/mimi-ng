import type { DocPage } from '../../../../doc-page/doc-page.types';
import { PopoverBasicExample } from './examples/popover-basic.example';
import { PopoverControlledExample } from './examples/popover-controlled.example';
import { PopoverCustomClassExample } from './examples/popover-custom-class.example';
import { PopoverFormExample } from './examples/popover-form.example';
import { PopoverPositionsExample } from './examples/popover-positions.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/popover-basic.example' with { loader: 'text' };
// @ts-expect-error
import controlledSource from './examples/popover-controlled.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/popover-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import formSource from './examples/popover-form.example' with { loader: 'text' };
// @ts-expect-error
import positionsSource from './examples/popover-positions.example' with { loader: 'text' };

/** La página de Popover (tarea G1.1), con la plantilla de página. */
export const POPOVER_PAGE: DocPage = {
  name: 'Popover',
  lead: 'Panel flotante junto a un botón, para contenido breve o un formulario pequeño, que se cierra con Escape o con un clic fuera.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Título, descripción y un botón que cierra. Al abrir, el foco pasa al primer elemento del panel.',
    component: PopoverBasicExample,
    source: basicSource as string,
  },
  install: 'popover',
  usage: {
    code: [
      "import { MimiPopoverImports } from '@/components/ui/popover';",
      '',
      '@Component({',
      "  selector: 'app-invite',",
      '  imports: [MimiPopoverImports, MimiButton],',
      '  template: `',
      '    <mimi-popover side="bottom" align="center">',
      '      <button mimiBtn variant="outline" mimiPopoverTrigger>Invitar</button>',
      '      <ng-template mimiPopoverContent>',
      '        <h4 mimiPopoverTitle>Invitar al proyecto</h4>',
      '        <p mimiPopoverDescription>Recibirá un enlace por correo.</p>',
      '        <button mimiBtn mimiPopoverClose>Listo</button>',
      '      </ng-template>',
      '    </mimi-popover>',
      '  `,',
      '})',
      'export class InviteComponent {}',
    ].join('\n'),
    note: '`class` y `aria-label` van en `<mimi-popover>` y se aplican al panel: escritos en el `ng-template`, se perderían.',
  },
  examples: {
    advanced: [
      {
        id: 'positions',
        title: 'Posiciones',
        sentence:
          '`side` elige el lado y `align`, la alineación. Si el panel no cabe, se da vuelta solo; la flecha siempre apunta al botón.',
        component: PopoverPositionsExample,
        source: positionsSource as string,
      },
      {
        id: 'form',
        title: 'Con un formulario',
        sentence:
          'El diseño de «Invitar al proyecto». Al enviar, el formulario cierra el popover con `[(open)]`.',
        component: PopoverFormExample,
        source: formSource as string,
      },
      {
        id: 'controlled',
        title: 'Controlado',
        sentence:
          'Con `[(open)]` lo abres o cierras desde tu código, y sabes cuándo lo cierra el usuario.',
        component: PopoverControlledExample,
        source: controlledSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'El `class` de `mimi-popover` va al panel: una píldora sin flecha. Sin título, el nombre accesible va en `aria-label`.',
        component: PopoverCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'El botón lleva `aria-haspopup="dialog"`, `aria-expanded` y `aria-controls`; un clic abre y cierra.',
      'El panel es un `role="dialog"` no modal: Tab sale del panel hacia el resto de la página, que sigue disponible.',
      'Al abrir, el foco va al elemento con `autofocus` o al primero enfocable del panel.',
      'Escape o un clic fuera lo cierran, y el foco vuelve al botón.',
      'Necesita un nombre: márcalo con `mimiPopoverTitle` o usa `aria-label`. En modo desarrollo, avisa en la consola si falta.',
      'Con movimiento reducido, abre y cierra sin animación.',
    ],
    more: [
      'Se abre como popover nativo del navegador (en la capa superior), junto al botón en el DOM: no lo tapa ningún `z-index` ni `overflow`, y el orden de Tab sigue al botón.',
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
        default: "'center'",
        description: 'Alineación con el botón.',
      },
      {
        name: 'arrow',
        type: 'boolean',
        default: 'true',
        description: 'Flecha hacia el botón. Es decorativa: `aria-hidden` y sin foco.',
      },
      {
        name: 'blocked',
        type: 'boolean',
        default: 'false',
        description:
          'El botón no abre el panel (sigue enfocable). Un `open` puesto desde fuera sigue funcionando.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: '—',
        description:
          'Nombre accesible del panel (no del anfitrión). Con `mimiPopoverTitle` no hace falta.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description:
          'Clases del panel, mezcladas con `cn()`: las tuyas ganan. También en `mimiPopoverTitle` y `mimiPopoverDescription`.',
      },
    ],
    outputs: [{ name: 'openChange', type: 'boolean', description: 'Se abrió o se cerró.' }],
    parts: [
      {
        name: 'MimiPopover',
        selector: 'mimi-popover',
        description: 'Contenedor: estado, posición y nombre accesible. Su `class` va al panel.',
      },
      {
        name: 'MimiPopoverTrigger',
        selector: '[mimiPopoverTrigger]',
        description: 'El botón que abre y cierra el panel.',
      },
      {
        name: 'MimiPopoverContent',
        selector: 'ng-template[mimiPopoverContent]',
        description: 'El contenido. Se crea al abrir y se destruye al cerrar.',
      },
      {
        name: 'MimiPopoverTitle',
        selector: '[mimiPopoverTitle]',
        description: 'Título: da el nombre accesible al panel (`aria-labelledby`).',
      },
      {
        name: 'MimiPopoverDescription',
        selector: '[mimiPopoverDescription]',
        description: 'Texto secundario (`aria-describedby`).',
      },
      {
        name: 'MimiPopoverClose',
        selector: '[mimiPopoverClose]',
        description: 'Cierra al hacer clic y devuelve el foco al botón.',
      },
    ],
    dataAttributes: ['data-state', 'data-side', 'data-align'],
  },
  tokens: 'popover',
};
