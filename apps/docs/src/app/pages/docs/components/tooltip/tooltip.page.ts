import type { DocPage } from '../../../../doc-page/doc-page.types';
import { TooltipBasicExample } from './examples/tooltip-basic.example';
import { TooltipDelayExample } from './examples/tooltip-delay.example';
import { TooltipDisabledExample } from './examples/tooltip-disabled.example';
import { TooltipIconButtonExample } from './examples/tooltip-icon-button.example';
import { TooltipPositionsExample } from './examples/tooltip-positions.example';
import { TooltipSizesExample } from './examples/tooltip-sizes.example';
import { TooltipToolbarExample } from './examples/tooltip-toolbar.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/tooltip-basic.example' with { loader: 'text' };
// @ts-expect-error
import delaySource from './examples/tooltip-delay.example' with { loader: 'text' };
// @ts-expect-error
import disabledSource from './examples/tooltip-disabled.example' with { loader: 'text' };
// @ts-expect-error
import iconButtonSource from './examples/tooltip-icon-button.example' with { loader: 'text' };
// @ts-expect-error
import positionsSource from './examples/tooltip-positions.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/tooltip-sizes.example' with { loader: 'text' };
// @ts-expect-error
import toolbarSource from './examples/tooltip-toolbar.example' with { loader: 'text' };

/** La página de Tooltip (tarea G1.2), con la plantilla de página. */
export const TOOLTIP_PAGE: DocPage = {
  name: 'Tooltip',
  lead: 'Texto breve que aparece al pasar el puntero o al llegar con el teclado a un elemento, con el atributo `mimiTooltip`.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Pasa el puntero o llega con Tab. Escape lo cierra.',
    component: TooltipBasicExample,
    source: basicSource as string,
  },
  install: 'tooltip',
  usage: {
    code: [
      "import { MimiButton } from '@/components/ui/button';",
      "import { MimiTooltip } from '@/components/ui/tooltip';",
      '',
      '@Component({',
      "  selector: 'app-save',",
      '  imports: [MimiTooltip, MimiButton],',
      '  template: `',
      '    <button mimiBtn mimiTooltip="Guarda los cambios" mimiTooltipSide="bottom">',
      '      Guardar',
      '    </button>',
      '  `,',
      '})',
      'export class SaveComponent {}',
    ].join('\n'),
    note: 'Solo texto: desaparece cuando el puntero o el foco se van. Para contenido interactivo, [Popover](/docs/components/popover).',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          'Toma el tamaño del contenedor del elemento; `mimiTooltipSize` lo fija. Cambian el texto (11,5, 12,5 y 13,5 px) y el relleno.',
        component: TooltipSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'disabled',
        title: 'Deshabilitado',
        sentence:
          '`mimiTooltipDisabled` lo apaga. Para explicar un botón deshabilitado, el tooltip va en un envoltorio enfocable: el botón no recibe puntero ni foco.',
        component: TooltipDisabledExample,
        source: disabledSource as string,
      },
    ],
    advanced: [
      {
        id: 'positions',
        title: 'Posiciones',
        sentence:
          '`mimiTooltipSide` elige el lado (arriba por defecto) y `mimiTooltipAlign`, la alineación. Si no cabe, se da vuelta solo.',
        component: TooltipPositionsExample,
        source: positionsSource as string,
      },
      {
        id: 'icon-button',
        title: 'En un botón de ícono',
        sentence:
          'El nombre del botón va en `aria-label`. Si el tooltip dice lo mismo, no se agrega como descripción y el lector no lo repite.',
        component: TooltipIconButtonExample,
        source: iconButtonSource as string,
      },
      {
        id: 'toolbar',
        title: 'Fila de botones',
        sentence:
          'Después del primer tooltip, los siguientes abren sin esperar si otro se cerró hace menos de 300 ms.',
        component: TooltipToolbarExample,
        source: toolbarSource as string,
      },
      {
        id: 'delay',
        title: 'Con retraso',
        sentence:
          'Por defecto espera 300 ms (`--mimi-tooltip-delay`, en el tema); `mimiTooltipDelay` lo cambia en un tooltip.',
        component: TooltipDelayExample,
        source: delaySource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Se abre con el puntero y con el foco de teclado, no con un clic. Escape lo cierra sin mover el foco.',
      'Lleva `role="tooltip"` y, mientras se ve, el elemento lo anuncia con `aria-describedby`.',
      'Si el texto ya está en el nombre del elemento (`aria-label` o `aria-labelledby`), no lo repite como descripción.',
      'Puedes pasar el puntero al tooltip sin que se cierre (WCAG 1.4.13).',
      'En pantallas táctiles no se muestra: no pongas ahí información esencial. En un botón de ícono, el nombre va en `aria-label`.',
      'Con movimiento reducido, aparece y desaparece sin animación.',
    ],
    more: [
      'En una pantalla táctil con un teclado conectado, sí aparece al llegar con Tab.',
      'Una pulsación larga no lo abre: chocaría con el menú y la selección del sistema.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'mimiTooltip',
        type: 'string',
        default: "''",
        description: 'El texto. Si está vacío, no se muestra. Solo texto: nada interactivo.',
      },
      {
        name: 'mimiTooltipSide',
        type: "'top' | 'right' | 'bottom' | 'left'",
        default: "'top'",
        description: 'Lado preferido. Si no cabe, pasa al opuesto y después a los otros dos.',
      },
      {
        name: 'mimiTooltipAlign',
        type: "'start' | 'center' | 'end'",
        default: "'center'",
        description: 'Alineación con el elemento.',
      },
      {
        name: 'mimiTooltipDelay',
        type: 'number',
        default: '--mimi-tooltip-delay (300ms)',
        description: 'Retraso al abrir, en ms. Sin él, se usa la variable del tema.',
      },
      {
        name: 'mimiTooltipDisabled',
        type: 'boolean',
        default: 'false',
        description: 'No lo muestra.',
      },
      {
        name: 'mimiTooltipShortcut',
        type: 'string',
        default: "''",
        description: 'Atajo de teclado, en monoespaciada (por ejemplo ⌘C).',
      },
      {
        name: 'mimiTooltipArrow',
        type: 'boolean',
        default: 'true',
        description: 'Flecha hacia el elemento. Es decorativa: `aria-hidden`.',
      },
      {
        name: 'mimiTooltipSize',
        type: "'sm' | 'md' | 'lg'",
        default: "el del [data-size] más cercano, o 'md'",
        description: 'Tamaño del tooltip. Sin él, toma el del contenedor con `mimiSize`.',
      },
      {
        name: 'mimiTooltipClass',
        type: 'string',
        default: "''",
        description:
          'Clases del tooltip, mezcladas con `cn()`: las tuyas ganan. El `class` del elemento es del propio elemento.',
      },
    ],
    dataAttributes: ['data-tooltip-state'],
  },
  tokens: 'tooltip',
};
