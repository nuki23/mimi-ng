import type { DocPage } from '../../../../doc-page/doc-page.types';
import { InputOtpPlaygroundExample } from './examples/input-otp-playground.example';
import { InputOtpSeparatorExample } from './examples/input-otp-separator.example';
import { InputOtpStatesExample } from './examples/input-otp-states.example';
import { InputOtpVerifyExample } from './examples/input-otp-verify.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import playgroundSource from './examples/input-otp-playground.example' with { loader: 'text' };
// @ts-expect-error
import separatorSource from './examples/input-otp-separator.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/input-otp-states.example' with { loader: 'text' };
// @ts-expect-error
import verifySource from './examples/input-otp-verify.example' with { loader: 'text' };

/** La página de Input OTP (tarea G2.5), con la plantilla de página (DP). */
export const INPUT_OTP_PAGE: DocPage = {
  name: 'Input OTP',
  lead: 'Campo para un código de un solo uso en casillas: el sistema puede proponerlo desde el SMS y se puede pegar entero.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Prueba con 246810: la verificación y el mensaje son tuyos; el componente solo pinta el éxito o el error.',
    component: InputOtpVerifyExample,
    source: verifySource as string,
  },
  install: 'input-otp',
  usage: {
    code: [
      "import { MimiInputOtp } from '@/components/ui/input-otp';",
      '',
      '@Component({',
      '  imports: [MimiInputOtp],',
      '  template: `',
      '    <mimi-input-otp aria-label="Código de verificación" [separatorAfter]="3" [(value)]="code" />',
      '  `,',
      '})',
      'export class VerifyComponent {',
      "  code = signal('');",
      '}',
    ].join('\n'),
    note: 'Un solo campo real, transparente, cubre las casillas: pegar, borrar y el autocompletado del SMS funcionan como siempre.',
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Estados y longitud',
        sentence:
          'Verificado, con error, deshabilitado y con 4 o 10 casillas; con muchas, se encogen para caber en el ancho.',
        component: InputOtpStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'playground',
        title: 'Casillas y grupos',
        sentence:
          'Cambia la cantidad de casillas, los grupos y el separador; debajo, el código que lo hace.',
        component: InputOtpPlaygroundExample,
        source: playgroundSource as string,
      },
      {
        id: 'separator',
        title: 'Separador propio',
        sentence:
          'Un carácter con `separator`, o cualquier contenido, como un ícono, con `<ng-template mimiInputOtpSeparator>`.',
        component: InputOtpSeparatorExample,
        source: separatorSource as string,
      },
    ],
  },
  forms: 'input-otp',
  accessibility: {
    points: [
      'Una sola parada de Tab; el teclado es el del campo. Las casillas son decorativas (`aria-hidden`).',
      'Al pegar «246 810» o «246-810», se quitan los espacios y los guiones. Solo dígitos, salvo con `alphanumeric`.',
      'Nómbralo con `aria-label`, `aria-labelledby` o un `<label for>` con `id`: van al campo real.',
      'Con error, el campo lleva `aria-invalid="true"`; el rojo sale cuando es inválido y ya se tocó o modificó.',
      'Pon tu mensaje en un elemento con `role="status"` y enlázalo con `aria-describedby`.',
      'Con «reducir movimiento», el cursor no parpadea y el error no sacude la fila.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'string',
        default: "''",
        description:
          'El código, sin espacios ni guiones. Admite `[(value)]`, `[formField]`, `formControlName` y `[(ngModel)]`.',
      },
      {
        name: 'length',
        type: 'number',
        default: '6',
        description:
          'Cuántas casillas, sin tope. Con muchas, se encogen para caber; un código pegado más largo se recorta.',
      },
      {
        name: 'separatorAfter',
        type: 'number | number[]',
        default: '—',
        description:
          'Después de qué casilla va el separador, o una lista para varios grupos: `[3]`, `[4, 8]`.',
      },
      {
        name: 'separator',
        type: 'string',
        default: "''",
        description:
          'Separador propio, como texto (`·`, `/`). Sin él, el guion. `mimiInputOtpSeparator` gana sobre este.',
      },
      {
        name: 'alphanumeric',
        type: 'boolean',
        default: 'false',
        description:
          'Letras y dígitos (`inputmode="text"`). Por defecto, solo dígitos (`numeric`).',
      },
      {
        name: 'success',
        type: 'boolean',
        default: 'false',
        description:
          'El código se verificó: borde y anillo de éxito. El error lo da el formulario.',
      },
      {
        name: 'autocomplete',
        type: 'string',
        default: "'one-time-code'",
        description: 'El sistema propone el código del SMS.',
      },
      {
        name: 'aria-label / aria-labelledby / aria-describedby / id',
        type: 'string',
        default: '—',
        description: 'Van al campo real (con `id`, sirve un `<label for>`).',
      },
      {
        name: 'disabled / readonly',
        type: 'boolean',
        default: 'false',
        description: 'Deshabilitado o solo lectura.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases de la fila de casillas, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [
      {
        name: 'touch',
        type: 'void',
        description: 'Al salir del campo; el formulario lo marca como tocado.',
      },
    ],
    parts: [
      {
        name: 'MimiInputOtpSeparator',
        selector: 'ng-template[mimiInputOtpSeparator]',
        description:
          'Contenido propio del separador (un ícono, por ejemplo); se repite en cada separación.',
      },
    ],
    dataAttributes: [
      'data-state="empty|partial|complete"',
      'data-invalid',
      'data-success',
      'data-disabled',
      'data-readonly',
    ],
  },
  tokens: 'inputOtp',
};
