import type { DocPage } from '../../../../doc-page/doc-page.types';
import { AccordionControlledExample } from './examples/accordion-controlled.example';
import { AccordionCustomClassExample } from './examples/accordion-custom-class.example';
import { AccordionFaqExample } from './examples/accordion-faq.example';
import { AccordionHeaderExample } from './examples/accordion-header.example';
import { AccordionMultipleExample } from './examples/accordion-multiple.example';
import { AccordionSizesExample } from './examples/accordion-sizes.example';
import { AccordionStatesExample } from './examples/accordion-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import controlledSource from './examples/accordion-controlled.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/accordion-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import faqSource from './examples/accordion-faq.example' with { loader: 'text' };
// @ts-expect-error
import headerSource from './examples/accordion-header.example' with { loader: 'text' };
// @ts-expect-error
import multipleSource from './examples/accordion-multiple.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/accordion-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/accordion-states.example' with { loader: 'text' };

/** La página de Accordion (tarea G4.1), con la plantilla de página. */
export const ACCORDION_PAGE: DocPage = {
  name: 'Accordion',
  lead: 'Secciones que se abren y se cierran, una o varias a la vez, para preguntas frecuentes, ajustes o pasos largos.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Preguntas frecuentes con una abierta. Abrir otra cierra la anterior; con el teclado, Tab o las flechas entre cabeceras.',
    component: AccordionFaqExample,
    source: faqSource as string,
  },
  install: 'accordion',
  usage: {
    code: [
      "import { MimiAccordionImports } from '@/components/ui/accordion';",
      '',
      '@Component({',
      "  selector: 'app-faq',",
      '  imports: [MimiAccordionImports],',
      '  template: `',
      '    <mimi-accordion [(value)]="abierta">',
      '      <mimi-accordion-item value="envio" title="¿Cuánto tarda?">2 a 4 días.</mimi-accordion-item>',
      '      <mimi-accordion-item value="pago" title="¿Cómo pago?">Con tarjeta.</mimi-accordion-item>',
      '    </mimi-accordion>',
      '  `,',
      '})',
      "export class FaqComponent { abierta = signal<string | readonly string[] | null>('envio'); }",
    ].join('\n'),
    note: '`title` es el atajo de la cabecera; el contenido del ítem va al panel. Con `multiple`, `value` es una lista.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence: '`size` cambia el alto de la cabecera (44, 52 o 60 px), el relleno y el texto.',
        component: AccordionSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'multiple',
        title: 'Varios abiertos',
        sentence:
          'Con `multiple`, abrir uno no cierra los demás y `value` es la lista; `indicator="plus"` pone un más que gira.',
        component: AccordionMultipleExample,
        source: multipleSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Abierto, cerrado y deshabilitado, por ítem o en todo el acordeón. Lo deshabilitado sigue enfocable con Tab.',
        component: AccordionStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'header',
        title: 'Cabecera propia',
        sentence:
          'Las piezas `mimiAccordionStart`, `mimiAccordionTitle` y `mimiAccordionEnd` ponen un ícono, un título rico y una insignia.',
        component: AccordionHeaderExample,
        source: headerSource as string,
      },
      {
        id: 'controlled',
        title: 'Controlado',
        sentence:
          'Con `[(value)]` abres y cierras desde tu código: aquí, dos botones abren o cierran todos.',
        component: AccordionControlledExample,
        source: controlledSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Con class',
        sentence:
          '`class` se mezcla con `cn()` y gana la tuya: aquí, sin caja, con solo las líneas entre secciones.',
        component: AccordionCustomClassExample,
        source: customSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Cada cabecera es un `button` dentro de un encabezado (`role="heading"`, `aria-level` 3 o el de `level`).',
      'El botón lleva `aria-expanded` y `aria-controls`; el panel es una región con `aria-labelledby`.',
      'Enter y Espacio abren o cierran; ↑ y ↓ pasan de cabecera, con vuelta; Inicio y Fin van a la primera y la última.',
      'Todas las cabeceras están en el orden de Tab. Un panel cerrado queda `inert`: no recibe el foco.',
      'Deshabilitado: `aria-disabled`, sigue enfocable y no abre.',
      'Con movimiento reducido, sin animación al abrir ni al girar el ícono.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'string | string[] | null (model)',
        default: 'null',
        description:
          'Lo abierto: el `value` de un ítem o, con `multiple`, la lista. Admite `[(value)]`.',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'false',
        description: 'Varios abiertos a la vez.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Alto de la cabecera, relleno y texto.',
      },
      {
        name: 'indicator',
        type: "'chevron' | 'plus'",
        default: "'chevron'",
        description: 'El ícono: el chevrón gira 180° y el más, 45°.',
      },
      {
        name: 'level',
        type: 'number',
        default: '3',
        description: 'Nivel del encabezado de cada cabecera (`aria-level`), del 2 al 6.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Todo el acordeón deshabilitado. También existe en cada ítem.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del acordeón (y de cada ítem), mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [
      {
        name: 'valueChange',
        type: 'string | string[] | null',
        description: 'Se abrió o se cerró un ítem.',
      },
    ],
    parts: [
      {
        name: 'MimiAccordion',
        selector: 'mimi-accordion',
        description: 'El grupo: lo abierto, el modo y el tamaño.',
      },
      {
        name: 'MimiAccordionItem',
        selector: 'mimi-accordion-item',
        description: 'Un ítem: `value`, `title`, `disabled` y `class`. Su contenido va al panel.',
      },
      {
        name: 'MimiAccordionTitle',
        selector: '[mimiAccordionTitle]',
        description: 'Título rico de la cabecera, en lugar de `title`.',
      },
      {
        name: 'MimiAccordionStart',
        selector: '[mimiAccordionStart]',
        description: 'Un ícono antes del título (decorativo: `aria-hidden`).',
      },
      {
        name: 'MimiAccordionEnd',
        selector: '[mimiAccordionEnd]',
        description: 'Algo al final de la cabecera, como una insignia. Sin botones dentro.',
      },
    ],
    dataAttributes: ['data-state', 'data-size', 'data-multiple', 'data-disabled', 'data-indicator'],
  },
  tokens: 'accordion',
};
