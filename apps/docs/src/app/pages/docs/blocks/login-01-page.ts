import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/login-01/login-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/login-01/login-01.html' with { loader: 'text' };
// @ts-expect-error
import indexSource from '@/blocks/login-01/index' with { loader: 'text' };

/** Página del Block login-01 (B.2). */
@Component({
  selector: 'app-login-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="login-01"
      description="Inicio de sesión centrado: correo, contraseña con mostrar u ocultar, «recordarme» y botones de Google y GitHub. Listo para enchufar a tu autenticación con una salida."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Es una página: ponla en tus rutas y conecta las salidas con tu autenticación. Los textos
        están en inglés y en la plantilla (<code
          class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >login-01.html</code
        >): cámbialos ahí. El formulario usa Signal Forms; los mensajes de error salen de
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >provideMimiErrorMessages</code
        >.
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>Un solo <code class="font-mono text-[13px]">h1</code>, que da nombre al formulario.</li>
        <li>
          Al enviar con errores, se marcan todos los campos y el foco va al primero con error.
        </li>
        <li>
          El error de tu servidor sale en un <code class="font-mono text-[13px]">role="alert"</code>
          que está siempre en la página, encima del botón.
        </li>
        <li>
          Cargando: el botón dice «Signing in…», lleva
          <code class="font-mono text-[13px]">aria-busy</code> y
          <code class="font-mono text-[13px]">aria-disabled</code> (sigue enfocable) y el giro se
          detiene con «reducir movimiento».
        </li>
        <li>La trama de puntos y los íconos de las redes son decorativos.</li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login01Page {
  protected readonly usage = [
    '// app.routes.ts',
    "import { Login01 } from './blocks/login-01';",
    '',
    "export const routes: Routes = [{ path: 'login', component: Login01 }];",
    '',
    '// O dentro de tu página, con tu autenticación:',
    '<mimi-login-01',
    '  [loading]="auth.loading()"',
    '  [error]="auth.error()"',
    '  signupHref="/signup"',
    '  (submitted)="auth.signIn($event)"',
    '  (provider)="auth.signInWith($event)"',
    '/>',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'card', path: '/docs/components/card' },
    { name: 'input', path: '/docs/components/input' },
    { name: 'password', path: '/docs/components/password' },
    { name: 'checkbox', path: '/docs/components/switch' },
    { name: 'button', path: '/docs/components/button' },
    { name: 'form-field', path: '/docs/components/form-field' },
    { name: 'separator', path: '/docs/components/separator' },
  ];

  protected readonly files: BlockFile[] = [
    { name: 'login-01/login-01.ts', code: tsSource as string, lang: 'angular-ts' },
    { name: 'login-01/login-01.html', code: htmlSource as string, lang: 'angular-html' },
    { name: 'login-01/index.ts', code: indexSource as string, lang: 'typescript' },
  ];

  protected readonly states: BlockState[] = [
    { id: 'loading', label: 'Cargando' },
    { id: 'error', label: 'Con error' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Mientras compruebas las credenciales: «Signing in…» y no reenvía.',
    },
    {
      name: 'error',
      type: 'string | null',
      default: 'null',
      description: 'Error de tu servidor, en un role="alert" encima del botón.',
    },
    { name: 'forgotHref', type: 'string', default: "'#'", description: 'Enlace «Forgot it?».' },
    { name: 'signupHref', type: 'string', default: "'#'", description: 'Enlace «Sign up».' },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    {
      name: 'submitted',
      type: '{ email, password, remember }',
      default: '—',
      description: 'Formulario válido enviado (Login01Value).',
    },
    {
      name: 'provider',
      type: "'google' | 'github'",
      default: '—',
      description: 'Se pulsó el botón de una red.',
    },
  ];
}
