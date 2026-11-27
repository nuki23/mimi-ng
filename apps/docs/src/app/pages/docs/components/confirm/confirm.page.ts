import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ConfirmBasicExample } from './examples/confirm-basic.example';
import { ConfirmCustomClassExample } from './examples/confirm-custom-class.example';
import { ConfirmCustomTextsExample } from './examples/confirm-custom-texts.example';
import { ConfirmDangerExample } from './examples/confirm-danger.example';
import { ConfirmFromDialogExample } from './examples/confirm-from-dialog.example';
import { ConfirmFromMenuExample } from './examples/confirm-from-menu.example';
import { ConfirmIconExample } from './examples/confirm-icon.example';
import { ConfirmSizesExample } from './examples/confirm-sizes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/confirm-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/confirm-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import customTextsSource from './examples/confirm-custom-texts.example' with { loader: 'text' };
// @ts-expect-error
import dangerSource from './examples/confirm-danger.example' with { loader: 'text' };
// @ts-expect-error
import fromDialogSource from './examples/confirm-from-dialog.example' with { loader: 'text' };
// @ts-expect-error
import fromMenuSource from './examples/confirm-from-menu.example' with { loader: 'text' };
// @ts-expect-error
import iconSource from './examples/confirm-icon.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/confirm-sizes.example' with { loader: 'text' };

/** La página de Confirm (G1.7), con la plantilla de página (DP). Se usa con un servicio. */
export const CONFIRM_PAGE: DocPage = {
  name: 'Confirm',
  lead: 'Diálogo que pregunta antes de una acción y espera la respuesta: dos botones, sin X, con `if (await confirm(…))` en tu código.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      "Con `tone: 'danger'` el botón de confirmar va en rojo y el foco empieza en Cancelar, para que Enter no borre nada por accidente.",
    component: ConfirmDangerExample,
    source: dangerSource as string,
  },
  install: 'confirm',
  usage: {
    code: [
      'private readonly confirm = injectMimiConfirm();',
      '',
      'async remove(project: Project) {',
      '  const ok = await this.confirm({',
      "    title: '¿Eliminar este proyecto?',",
      "    description: 'Esta acción no se puede deshacer.',",
      "    tone: 'danger',",
      '  });',
      '  if (ok) this.projects.remove(project.id);',
      '}',
    ].join('\n'),
    note: '`confirm()` devuelve una promesa: `true` si se confirmó, `false` si no. Llama a `injectMimiConfirm()` al declarar la propiedad.',
    more: {
      summary: 'La promesa y el contexto de inyección',
      items: [
        'La promesa da `true` si se confirmó y `false` en cualquier otro caso: Cancelar, Escape o una navegación.',
        'Se resuelve cuando el diálogo ya se cerró y el foco volvió a su sitio.',
        '`injectMimiConfirm()` se llama al declarar la propiedad (o en el constructor): así toma los textos y los providers de tu componente y de su ruta.',
        'Dentro de un método falla con NG0203, porque no hay contexto de inyección. La función que devuelve sí se usa en cualquier método.',
      ],
    },
  },
  examples: {
    variants: [
      {
        id: 'basic',
        title: 'Tono primary',
        sentence: 'Título y descripción, sin ícono. El foco empieza en Confirmar: Enter confirma.',
        component: ConfirmBasicExample,
        source: basicSource as string,
      },
      {
        id: 'icon',
        title: 'Con ícono',
        sentence:
          'El ícono es opcional: sin `icon` no hay círculo. En el tono primary, el círculo usa los colores de info.',
        component: ConfirmIconExample,
        source: iconSource as string,
      },
    ],
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          'Los anchos de Dialog: `sm` (360px, por defecto), `md` (420px) y `lg` (560px). `--mimi-confirm-width` gana si lo defines.',
        component: ConfirmSizesExample,
        source: sizesSource as string,
      },
    ],
    advanced: [
      {
        id: 'custom-texts',
        title: 'Textos personalizados',
        sentence:
          '`confirmText` y `cancelText` cambian los botones de una sola pregunta. Para todas, usa `provideMimiConfirmText` (en «Textos», abajo).',
        component: ConfirmCustomTextsExample,
        source: customTextsSource as string,
      },
      {
        id: 'from-menu',
        title: 'Desde un menú',
        sentence:
          'Un ítem del Dropdown Menu pregunta antes de eliminar. Al cerrar, el foco vuelve al botón del menú.',
        component: ConfirmFromMenuExample,
        source: fromMenuSource as string,
      },
      {
        id: 'from-dialog',
        title: 'Desde un Dialog',
        sentence:
          'El confirm se abre encima del Dialog. Escape cierra solo el confirm y el foco vuelve al Dialog.',
        component: ConfirmFromDialogExample,
        source: fromDialogSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence: '`class` va al panel y gana sobre sus clases, también sobre el ancho.',
        component: ConfirmCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      '`role="alertdialog"` con `aria-modal`, nombrado por el título y descrito por la descripción. El ícono queda oculto a los lectores de pantalla.',
      "El foco empieza en Confirmar, o en Cancelar con `tone: 'danger'`. Enter y Espacio activan el botón enfocado; Tab pasa al otro.",
      'Escape cancela. El clic en el fondo no cierra, como en un AlertDialog.',
      'Al cerrar, el foco vuelve al elemento que lo abrió.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'title',
        type: 'string',
        default: '—',
        description: 'La pregunta (obligatoria). Es el nombre accesible del diálogo.',
      },
      {
        name: 'description',
        type: 'string',
        default: '—',
        description:
          'Qué pasa si se confirma. Recomendada: el lector de pantalla la anuncia junto al título.',
      },
      {
        name: 'confirmText',
        type: 'string',
        default: "'Confirm'",
        description: 'Texto del botón que confirma. Gana sobre `provideMimiConfirmText`.',
      },
      {
        name: 'cancelText',
        type: 'string',
        default: "'Cancel'",
        description: 'Texto del botón que cancela. Gana sobre `provideMimiConfirmText`.',
      },
      {
        name: 'tone',
        type: "'primary' | 'danger'",
        default: "'primary'",
        description:
          '`danger`: confirmar va en rojo y el foco empieza en Cancelar. Con `primary` empieza en Confirmar.',
      },
      {
        name: 'icon',
        type: 'TemplateRef',
        default: '—',
        description: 'Plantilla con un `<svg>` para el círculo de color. Sin ella, no hay círculo.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'sm'",
        description: 'Ancho, con los tamaños de Dialog. `--mimi-confirm-width` gana si lo defines.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del panel, mezcladas con `cn()`: tus clases ganan, también el ancho.',
      },
      {
        name: 'onConfirm',
        type: '() => unknown',
        default: '—',
        description:
          'Acción asíncrona: Confirmar carga hasta que termine. Si falla, sigue abierto: avisa del error con un Toast.',
      },
    ],
    dataAttributes: ['data-tone'],
    service: [
      {
        name: 'injectMimiConfirm()',
        type: 'MimiConfirmFn',
        description:
          'Devuelve la función `confirm`. Se llama al declarar la propiedad: toma los textos y providers de tu componente.',
      },
      {
        name: 'confirm(opciones)',
        type: 'Promise<boolean>',
        description:
          'Abre el diálogo con las opciones de Entradas. `true` si se confirmó; `false` con Cancelar, Escape o una navegación.',
      },
    ],
  },
  // El archivo concreto: los textos sin el Dialog, por si van en app.config.ts.
  texts: [
    {
      constant: 'MIMI_CONFIRM_TEXT_ES',
      provider: 'provideMimiConfirmText',
      path: 'confirm/confirm-texts',
    },
  ],
  tokens: 'confirm',
};
