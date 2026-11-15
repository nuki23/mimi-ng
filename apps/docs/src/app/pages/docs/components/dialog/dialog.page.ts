import type { DocPage } from '../../../../doc-page/doc-page.types';
import { DialogAskNameExample } from './examples/dialog-ask-name.example';
import { DialogBasicExample } from './examples/dialog-basic.example';
import { DialogCustomClassExample } from './examples/dialog-custom-class.example';
import { DialogFormExample } from './examples/dialog-form.example';
import { DialogFromMenuExample } from './examples/dialog-from-menu.example';
import { DialogLongContentExample } from './examples/dialog-long-content.example';
import { DialogNoDismissExample } from './examples/dialog-no-dismiss.example';
import { DialogOptionsExample } from './examples/dialog-options.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/dialog-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/dialog-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import askNameSource from './examples/dialog-ask-name.example' with { loader: 'text' };
// @ts-expect-error
import formSource from './examples/dialog-form.example' with { loader: 'text' };
// @ts-expect-error
import fromMenuSource from './examples/dialog-from-menu.example' with { loader: 'text' };
// @ts-expect-error
import longContentSource from './examples/dialog-long-content.example' with { loader: 'text' };
// @ts-expect-error
import noDismissSource from './examples/dialog-no-dismiss.example' with { loader: 'text' };
// @ts-expect-error
import optionsSource from './examples/dialog-options.example' with { loader: 'text' };
// @ts-expect-error
import askNameDialogSource from './examples/ask-name-dialog' with { loader: 'text' };

/** La página de Dialog (G1.6 y R.6/R.7), con la plantilla de página (DP.1). */
export const DIALOG_PAGE: DocPage = {
  name: 'Dialog',
  lead: 'Ventana modal para editar algo o pedir una decisión sin salir de la página, en tu plantilla o abriendo un componente tuyo.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'El servicio abre `AskNameDialog` con el nombre en su entrada; al guardar, la página recibe el nuevo.',
    component: DialogAskNameExample,
    source: askNameSource as string,
    files: [
      { name: 'dialog-ask-name.example.ts', code: askNameSource as string },
      { name: 'ask-name-dialog.ts', code: askNameDialogSource as string },
    ],
  },
  install: 'dialog',
  usage: {
    code: [
      '// Quien abre: tu componente, con los valores de sus entradas.',
      'const ref = inject(MimiDialogService).open<string>(AskNameDialog, {',
      '  inputs: { name },',
      '});',
      'ref.afterClosed().subscribe((newName) => { /* undefined si se canceló */ });',
      '',
      '// Dentro de AskNameDialog: entradas normales y ref.close(resultado).',
      'name = input.required<string>();',
      'ref = inject<MimiDialogRef<string>>(MimiDialogRef);',
      'save() { this.ref.close(this.value()); }',
    ].join('\n'),
    note: 'Tu componente se abre dentro del panel y `afterClosed()` entrega su resultado. Las opciones valen también como entradas de `<mimi-dialog>`.',
  },
  examples: {
    sizes: [
      {
        id: 'options',
        title: 'Tamaños y opciones',
        sentence:
          'El mismo contenido con `size` (sm 360px, md 420px, lg 560px), `maxWidth`, `panelClass` y `chrome: none`, sin la X ni el relleno.',
        component: DialogOptionsExample,
        source: optionsSource as string,
      },
    ],
    advanced: [
      {
        id: 'template',
        title: 'En la plantilla: <mimi-dialog>',
        sentence:
          'Para casos pequeños, el contenido vive en tu plantilla con tus signals. Al abrir, el foco va al primer campo; al cerrar, vuelve al botón.',
        component: DialogBasicExample,
        source: basicSource as string,
      },
      {
        id: 'form',
        title: 'Formulario dentro',
        sentence:
          'El `<form>` envuelve el cuerpo y el pie y cierra solo si es válido. Escape cierra primero el panel del Select.',
        component: DialogFormExample,
        source: formSource as string,
      },
      {
        id: 'no-dismiss',
        title: 'Sin cierre al hacer clic fuera',
        sentence:
          '`disableClose` apaga Escape y el clic en el fondo (por separado: `closeOnEscape` y `closeOnBackdropClick`). La X sigue cerrando.',
        component: DialogNoDismissExample,
        source: noDismissSource as string,
      },
      {
        id: 'long-content',
        title: 'Contenido largo',
        sentence:
          'El scroll queda en `mimi-dialog-body`: el encabezado y el pie no se mueven, y la página de detrás tampoco.',
        component: DialogLongContentExample,
        source: longContentSource as string,
      },
      {
        id: 'from-menu',
        title: 'Desde un menú',
        sentence:
          'Sin `mimiDialogTrigger`: un ítem del Dropdown Menu lo abre con `[(open)]`. Al cerrar, el foco vuelve al botón del menú.',
        component: DialogFromMenuExample,
        source: fromMenuSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          '`width`, `maxWidth` y `class` van al panel. Cada pieza acepta también su `class`.',
        component: DialogCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Al abrir, el foco va al primer elemento enfocable del contenido (la X es el último); con `autoFocus` eliges otro.',
      'Tab y Shift+Tab recorren solo el diálogo y Escape lo cierra. Al cerrar, el foco vuelve a quien lo abrió.',
      '`role="dialog"` con `aria-modal`, nombrado por el título y descrito por la descripción; el resto de la página queda oculto al lector.',
      'Sin `mimiDialogTitle`, da un `aria-label` (o `ariaLabel` al abrirlo): en desarrollo, un diálogo sin nombre avisa en la consola.',
      'La página de detrás no se desplaza mientras el diálogo está abierto.',
      'Con movimiento reducido, sin animación.',
    ],
    more: [
      'Con un diálogo encima de otro, los lectores de pantalla solo ven el de arriba; al cerrarlo, vuelve el de abajo con el foco.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'open',
        type: 'boolean (model)',
        default: 'false',
        description: 'En la plantilla: abre y cierra el diálogo, con `[(open)]`.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description:
          'Ancho: sm 360px, md 420px o lg 560px, sin pasar de la pantalla. `width` y `maxWidth` mandan.',
      },
      {
        name: 'width',
        type: 'string',
        default: '420px',
        description: 'Ancho del panel (cualquier valor CSS). Por defecto, `--mimi-dialog-width`.',
      },
      {
        name: 'maxWidth',
        type: 'string',
        default: '100vw − 32px',
        description: 'Ancho máximo. Nunca supera el ancho de la pantalla menos 32px.',
      },
      {
        name: 'padding',
        type: 'string',
        default: '24px (16px en sm)',
        description:
          'Relleno lateral de la cabecera, el cuerpo y el pie (`--mimi-dialog-padding`).',
      },
      {
        name: 'chrome',
        type: "'default' | 'none'",
        default: "'default'",
        description:
          '`none`: el contenido es todo el panel, sin X ni relleno. `closeButton` y `padding` explícitos mandan.',
      },
      {
        name: 'data',
        type: 'D',
        default: '—',
        description: 'Datos para el contenido: `inject(MIMI_DIALOG_DATA)`. Solo con el servicio.',
      },
      {
        name: 'inputs',
        type: 'Record<string, unknown>',
        default: '—',
        description:
          'Solo con un componente: los valores de sus entradas, asignados antes de pintarse.',
      },
      {
        name: 'class / panelClass',
        type: 'string',
        default: "''",
        description:
          'Clases del panel, mezcladas con `cn()`: las tuyas ganan. Si das las dos, gana `class`.',
      },
      {
        name: 'closeOnEscape',
        type: 'boolean',
        default: 'true',
        description: 'Escape cierra.',
      },
      {
        name: 'closeOnBackdropClick',
        type: 'boolean',
        default: 'true',
        description: 'Un clic en el fondo cierra.',
      },
      {
        name: 'disableClose',
        type: 'boolean',
        default: 'false',
        description: 'Atajo: ni Escape ni el clic en el fondo cierran. La X sigue funcionando.',
      },
      {
        name: 'closeButton',
        type: 'boolean',
        default: 'true',
        description:
          'La X. Ocúltala solo en confirmaciones que tienen sus propios botones de salida.',
      },
      {
        name: 'ariaLabel (aria-label en la plantilla)',
        type: 'string',
        default: '—',
        description: 'Nombre accesible, si el contenido no tiene un `mimiDialogTitle`.',
      },
      {
        name: 'autoFocus',
        type: "'first' | 'dialog' | selector CSS",
        default: "'first'",
        description: 'A dónde va el foco al abrir: el primer enfocable, el panel o un selector.',
      },
      {
        name: 'role',
        type: "'dialog' | 'alertdialog'",
        default: "'dialog'",
        description: '`alertdialog` para una confirmación que interrumpe. Solo con el servicio.',
      },
      {
        name: 'injector',
        type: 'Injector',
        default: 'el de la app',
        description: 'Injector para el contenido. Solo con el servicio.',
      },
    ],
    outputs: [
      {
        name: 'openChange',
        type: 'boolean',
        description: 'En la plantilla: el diálogo se abrió o se cerró (`[(open)]`).',
      },
      {
        name: 'closed',
        type: 'unknown',
        description: 'En la plantilla: el diálogo se cerró, con su resultado.',
      },
    ],
    dataAttributes: ['data-state'],
    parts: [
      {
        name: 'MimiDialog',
        selector: 'mimi-dialog',
        description:
          'El diálogo en la plantilla, con `[(open)]` y las opciones. Su `class` va al panel.',
      },
      {
        name: 'MimiDialogTrigger',
        selector: '[mimiDialogTrigger]',
        description: 'El botón que lo abre (opcional).',
      },
      {
        name: 'MimiDialogContent',
        selector: 'ng-template[mimiDialogContent]',
        description: 'El contenido. Se crea al abrir y se destruye al cerrar.',
      },
      {
        name: 'MimiDialogHeader',
        selector: 'mimi-dialog-header',
        description: 'Encabezado, con sitio para la X a la derecha.',
      },
      {
        name: 'MimiDialogTitle',
        selector: '[mimiDialogTitle]',
        description: 'El título (en un `<h2>`): le da al diálogo su nombre accesible.',
      },
      {
        name: 'MimiDialogDescription',
        selector: '[mimiDialogDescription]',
        description: 'La descripción (`aria-describedby`).',
      },
      {
        name: 'MimiDialogBody',
        selector: 'mimi-dialog-body',
        description: 'El cuerpo. Si el contenido no cabe, el scroll queda aquí.',
      },
      {
        name: 'MimiDialogFooter',
        selector: 'mimi-dialog-footer',
        description: 'El pie, con las acciones a la derecha.',
      },
      {
        name: 'MimiDialogClose',
        selector: '[mimiDialogClose]',
        description: 'Cierra al hacer clic. Con un valor, ese es el resultado.',
      },
    ],
    service: [
      {
        name: 'MimiDialogService.open(contenido, opciones?)',
        type: 'MimiDialogRef<R>',
        description:
          'Abre un componente o un `TemplateRef` con las opciones de Entradas y devuelve su referencia.',
      },
      {
        name: 'MimiDialogService.closeAll()',
        type: 'void',
        description: 'Cierra todos los diálogos abiertos.',
      },
      {
        name: 'MimiDialogRef.close(resultado?)',
        type: 'void',
        description: 'Cierra el diálogo, con un resultado opcional.',
      },
      {
        name: 'MimiDialogRef.afterClosed() / closed',
        type: 'Observable<R | undefined>',
        description:
          'Emite una vez, con el resultado, cuando el diálogo ya se cerró (`undefined` si se canceló).',
      },
      {
        name: 'MimiDialogRef.result',
        type: 'Signal<R | undefined>',
        description: 'El resultado como señal: `undefined` hasta que se cierra con un resultado.',
      },
      {
        name: 'MIMI_DIALOG_DATA',
        type: 'InjectionToken<D>',
        description:
          'Los `data` de las opciones, dentro del contenido: `inject(MIMI_DIALOG_DATA)`.',
      },
    ],
  },
  texts: [{ constant: 'MIMI_DIALOG_TEXT_ES', provider: 'provideMimiDialogText', path: 'dialog' }],
  tokens: 'dialog',
};
