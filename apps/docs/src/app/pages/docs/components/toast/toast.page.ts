import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ToastActionExample } from './examples/toast-action.example';
import { ToastBasicExample } from './examples/toast-basic.example';
import { ToastCustomClassExample } from './examples/toast-custom-class.example';
import { ToastInDialogExample } from './examples/toast-in-dialog.example';
import { ToastPromiseExample } from './examples/toast-promise.example';
import { ToastSizesExample } from './examples/toast-sizes.example';
import { ToastSolidExample } from './examples/toast-solid.example';
import { ToastTonesExample } from './examples/toast-tones.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import actionSource from './examples/toast-action.example' with { loader: 'text' };
// @ts-expect-error
import basicSource from './examples/toast-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/toast-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import inDialogSource from './examples/toast-in-dialog.example' with { loader: 'text' };
// @ts-expect-error
import promiseSource from './examples/toast-promise.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/toast-sizes.example' with { loader: 'text' };
// @ts-expect-error
import solidSource from './examples/toast-solid.example' with { loader: 'text' };
// @ts-expect-error
import tonesSource from './examples/toast-tones.example' with { loader: 'text' };

/** La página de Toast (G1.8), con la plantilla de página (DP). Se usa con un servicio. */
export const TOAST_PAGE: DocPage = {
  name: 'Toast',
  lead: 'Avisos breves que aparecen en una esquina y se van solos, lanzados desde tu código sin poner nada en la plantilla.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Título y descripción. Se cierra solo a los 6 segundos; al pasar el puntero, la pila se abre.',
    component: ToastBasicExample,
    source: basicSource as string,
  },
  install: 'toast',
  usage: {
    code: [
      '// injectMimiToast() al declarar la propiedad: necesita el contexto de inyección.',
      'private readonly toast = injectMimiToast();',
      '',
      'save() {',
      "  this.toast.success('Cambios guardados');",
      "  this.toast.error('No se pudo guardar', {",
      "    description: 'Revisa tu conexión.',",
      "    action: { label: 'Reintentar', onClick: () => this.save() },",
      '  });',
      '}',
    ].join('\n'),
    note: 'Llama a `injectMimiToast()` al declarar la propiedad, no dentro de un método. La pila se crea sola.',
    more: {
      summary: 'Posición, duración y tecla: provideMimiToast()',
      items: [
        'Hay una sola pila por aplicación y vive en la raíz: los toasts sobreviven a la navegación.',
        "`provideMimiToast({ position: 'top-center', duration: 5000, hotkey: 'F8' })` en `app.config.ts` cambia la posición, la duración y la tecla de todos. Es opcional.",
        'Posiciones: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` y `bottom-right` (la de por defecto).',
        'Importa `provideMimiToast` de `@/components/ui/toast/toast-config`: así Toast no entra en el JS inicial.',
      ],
    },
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`size` en cada aviso (`sm`, `md` o `lg`), o para todos con `provideMimiToast({ size })`.',
        component: ToastSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'tones',
        title: 'Tonos',
        sentence:
          'Cada tono trae su ícono. Con `icon` pones el tuyo (una plantilla con un `<svg>`), o ninguno con `false`.',
        component: ToastTonesExample,
        source: tonesSource as string,
      },
      {
        id: 'solid',
        title: 'Sólidos',
        sentence: "`variant: 'solid'`: el toast toma el color del tono.",
        component: ToastSolidExample,
        source: solidSource as string,
      },
    ],
    advanced: [
      {
        id: 'action',
        title: 'Con acción',
        sentence:
          'Con acción no se cierra solo, para llegar a él con el teclado: F8 lleva el foco a los toasts y Escape lo devuelve.',
        component: ToastActionExample,
        source: actionSource as string,
      },
      {
        id: 'promise',
        title: 'Con una promesa',
        sentence: '`toast.promise` muestra «cargando» y lo reemplaza por el éxito o el error.',
        component: ToastPromiseExample,
        source: promiseSource as string,
      },
      {
        id: 'in-dialog',
        title: 'Desde un Dialog',
        sentence:
          'Con un diálogo abierto, el toast queda encima del diálogo y de su fondo, y se anuncia igual.',
        component: ToastInDialogExample,
        source: inDialogSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence: '`class` va al toast y gana sobre sus clases.',
        component: ToastCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Los lectores de pantalla anuncian cada toast (título y descripción); los de error, con prioridad. La región de los anuncios existe antes del primer toast.',
      'F8 lleva el foco al toast más nuevo y abre la pila; Tab recorre sus botones; Escape devuelve el foco a donde estaba.',
      'El tiempo se detiene con el puntero encima, con el foco dentro y con la pestaña oculta. Los toasts con acción no se cierran solos.',
      'La X tiene nombre («Cerrar notificación»). Los toasts quedan encima de los diálogos.',
      'Con movimiento reducido, sin desplazamientos.',
      'El nombre de la región («Notificaciones (F8)») se lee en la raíz: pon `provideMimiToastText` en `app.config.ts`, no en un componente.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'description',
        type: 'string',
        default: '—',
        description: 'Texto bajo el título.',
      },
      {
        name: 'action',
        type: '{ label, onClick }',
        default: '—',
        description:
          'Botón de acción. Al pulsarlo, el toast se cierra. Con acción no se cierra solo.',
      },
      {
        name: 'duration',
        type: 'number',
        default: '6000',
        description: 'Milisegundos hasta cerrarse. `Infinity`: no se cierra solo.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "el de provideMimiToast, o 'md'",
        description:
          'Tamaño de este aviso (relleno, texto e ícono). El ancho de la pila es el de `provideMimiToast({ size })`.',
      },
      {
        name: 'icon',
        type: 'TemplateRef | false',
        default: 'el del tono',
        description:
          'Ícono propio (una plantilla con un `<svg>`), o `false` para no mostrar ninguno.',
      },
      {
        name: 'variant',
        type: "'neutral' | 'outline' | 'solid'",
        default: "'outline'",
        description:
          '`outline`: contorno y fondo suave del tono; `neutral`: solo el ícono de color; `solid`: fondo del tono.',
      },
      {
        name: 'id',
        type: 'string',
        default: '—',
        description: 'Con el id de un toast abierto, lo reemplaza.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del toast, mezcladas con `cn()`: tus clases ganan.',
      },
    ],
    dataAttributes: ['data-state', 'data-variant', 'data-size', 'data-tone'],
    service: [
      {
        name: 'injectMimiToast()',
        type: 'MimiToastFn',
        description:
          'Devuelve la función `toast`. Se llama al declarar la propiedad: dentro de un método falla con NG0203.',
      },
      {
        name: 'toast(título, opciones?)',
        type: 'string',
        description: 'Toast neutro, con las opciones de Entradas. Devuelve su id.',
      },
      {
        name: 'toast.success / info / warning / error',
        type: 'string',
        description:
          'Con el tono y su ícono. `error` usa el tono danger y se anuncia con prioridad.',
      },
      {
        name: 'toast.promise(promesa, { loading, success, error })',
        type: 'Promise<T>',
        description:
          'Cargando mientras está pendiente y después el resultado. Devuelve la misma promesa.',
      },
      {
        name: 'toast.dismiss(id?)',
        type: 'void',
        description: 'Cierra un toast, o todos sin id.',
      },
      {
        name: 'provideMimiToast({ position, duration, hotkey, size })',
        type: 'Provider',
        description:
          "Opciones de todos: posición (`'bottom-right'`), duración (6000), tecla (`'F8'`) y tamaño (`'md'`; ancho sm 288px, md 340px, lg 400px).",
      },
    ],
  },
  // El archivo concreto: así los textos no llevan Toast al JS inicial (van en app.config.ts).
  texts: [
    { constant: 'MIMI_TOAST_TEXT_ES', provider: 'provideMimiToastText', path: 'toast/toast-texts' },
  ],
  tokens: 'toast',
};
