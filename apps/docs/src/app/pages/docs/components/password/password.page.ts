import type { DocPage } from '../../../../doc-page/doc-page.types';
import { PasswordCustomExample } from './examples/password-custom.example';
import { PasswordLevelsExample } from './examples/password-levels.example';
import { PasswordLoginExample } from './examples/password-login.example';
import { PasswordNewExample } from './examples/password-new.example';
import { PasswordStatesExample } from './examples/password-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customSource from './examples/password-custom.example' with { loader: 'text' };
// @ts-expect-error
import levelsSource from './examples/password-levels.example' with { loader: 'text' };
// @ts-expect-error
import loginSource from './examples/password-login.example' with { loader: 'text' };
// @ts-expect-error
import newSource from './examples/password-new.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/password-states.example' with { loader: 'text' };

/** La página de Password (tarea G2.3), con la plantilla de página (DP.1). */
export const PASSWORD_PAGE: DocPage = {
  name: 'Password',
  lead: 'Campo de contraseña con un botón para mostrarla u ocultarla y, si lo pides, un medidor orientativo con reglas.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Con `meter`, el medidor y sus reglas debajo del campo. Escribe una contraseña para ver cómo sube el nivel.',
    component: PasswordNewExample,
    source: newSource as string,
  },
  install: 'password',
  usage: {
    code: [
      "import { MimiInput } from '@/components/ui/input';",
      "import { MimiPassword } from '@/components/ui/password';",
      '',
      '@Component({',
      "  selector: 'app-sign-up',",
      '  imports: [MimiPassword, MimiInput],',
      '  template: `',
      '    <mimi-password meter>',
      '      <input mimiInput type="password" autocomplete="new-password" aria-label="Contraseña" />',
      '    </mimi-password>',
      '  `,',
      '})',
      'export class SignUpComponent {}',
    ].join('\n'),
    note: 'El `<input mimiInput>` es tuyo, con su `autocomplete` y su formulario. Mostrar solo cambia su `type`.',
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Estados y confirmación',
        sentence:
          '«No coinciden» es un validador de tu formulario: sal del segundo campo para verlo. Al lado, deshabilitado y solo lectura.',
        component: PasswordStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'login',
        title: 'Inicio de sesión',
        sentence:
          'Sin medidor y con `autocomplete="current-password"`, para que el gestor de contraseñas ofrezca la guardada.',
        component: PasswordLoginExample,
        source: loginSource as string,
      },
      {
        id: 'levels',
        title: 'Niveles',
        sentence:
          'Débil, media y fuerte. El medidor cuenta reglas, no mide cuánto cuesta adivinarla: para una medida real, pasa tu función en `[strength]`.',
        component: PasswordLevelsExample,
        source: levelsSource as string,
      },
    ],
    custom: [
      {
        id: 'custom',
        title: 'Personalizar',
        sentence:
          '`class` va a la caja y `[rules]` cambia las reglas del medidor. Escribe para ver cuáles cumples.',
        component: PasswordCustomExample,
        source: customSource as string,
      },
    ],
  },
  forms: 'password',
  accessibility: {
    points: [
      'Nombra el campo como cualquier `<input>`: con un `<label for>`, `aria-label` o dentro de `mimi-form-field`.',
      'El botón es una parada de Tab después del campo, con `aria-pressed`; su nombre es fijo («Mostrar contraseña») y el foco se queda en él.',
      'El medidor describe al campo con `aria-describedby`, sin borrar el tuyo; las barras son decorativas.',
      'El nivel se anuncia solo cuando cambia al escribir, no en cada tecla.',
      'Con el campo deshabilitado, el botón también lo está.',
      'En Edge, el ojo propio del navegador se oculta: hay uno solo.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'meter',
        type: 'boolean',
        default: 'false',
        description: 'Muestra el medidor (nivel y reglas) debajo del campo. Es orientativo.',
      },
      {
        name: 'rules',
        type: 'MimiPasswordRule[]',
        default: 'las cuatro del diseño',
        description:
          '`{ label, test(value) }`. Por defecto: 8 caracteres, una mayúscula, un número y un símbolo. Con `[]`, sin lista.',
      },
      {
        name: 'strength',
        type: '(value: string) => 0 | 1 | 2 | 3',
        default: 'la heurística',
        description:
          'Nivel propio. Por defecto: todas las reglas, fuerte; al menos la mitad, media; menos, débil.',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description:
          'El `<input>` de dentro queda `readonly`: se ve y se enfoca, pero no se edita. El ojo sigue funcionando.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'El alto de la caja, el mismo de Input.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases de la caja. Se mezclan con `cn()`: las tuyas ganan.',
      },
    ],
    dataAttributes: [
      'data-state',
      'data-level',
      'data-size',
      'data-invalid',
      'data-disabled',
      'data-readonly',
    ],
  },
  texts: [
    {
      constant: 'MIMI_PASSWORD_TEXT_ES',
      provider: 'provideMimiPasswordText',
      path: 'password/password-texts',
    },
  ],
  tokens: 'password',
};
