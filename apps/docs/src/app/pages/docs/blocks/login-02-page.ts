import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/login-02/login-02' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/login-02/login-02.html' with { loader: 'text' };
// @ts-expect-error
import indexSource from '@/blocks/login-02/index' with { loader: 'text' };

/** Página del Block login-02 (B.3). */
@Component({
  selector: 'app-login-02-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="login-02"
      description="Inicio de sesión en dos columnas: el formulario a un lado y tu imagen con un testimonio en vidrio al otro. En móvil, la imagen es un banner arriba."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Ponla en tus rutas y da tu imagen con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">imageSrc</code>.
        Sin imagen se ve un degradado neutro, provisional hasta que el diseño tenga una. El
        testimonio está escrito en la plantilla: cámbialo ahí. El Block no trae archivos de imagen
        (la CLI solo copia texto).
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          La imagen es decorativa (<code class="font-mono text-[13px]">alt=""</code>) salvo que des
          <code class="font-mono text-[13px]">imageAlt</code>.
        </li>
        <li>
          El testimonio es un <code class="font-mono text-[13px]">figure</code> con
          <code class="font-mono text-[13px]">blockquote</code> y
          <code class="font-mono text-[13px]">figcaption</code>. Con «reducir transparencia», el
          vidrio pasa a un fondo sólido. Comprueba el contraste del texto sobre tu imagen, en claro
          y en oscuro.
        </li>
        <li>
          Como login-01: foco al primer error, error en un role="alert" y aria-busy al cargar.
        </li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login02Page {
  protected readonly usage = [
    "import { Login02 } from './blocks/login-02';",
    '',
    "export const routes: Routes = [{ path: 'login', component: Login02 }];",
    '',
    '<mimi-login-02',
    '  imageSrc="/img/login.jpg"',
    '  [loading]="auth.loading()"',
    '  [error]="auth.error()"',
    '  (submitted)="auth.signIn($event)"',
    '  (sso)="auth.signInWithSso()"',
    '/>',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'input', path: '/docs/components/input' },
    { name: 'button', path: '/docs/components/button' },
    { name: 'form-field', path: '/docs/components/form-field' },
    { name: 'avatar', path: '/docs/components/avatar' },
  ];

  protected readonly files: BlockFile[] = [
    { name: 'login-02/login-02.ts', code: tsSource as string, lang: 'angular-ts' },
    { name: 'login-02/login-02.html', code: htmlSource as string, lang: 'angular-html' },
    { name: 'login-02/index.ts', code: indexSource as string, lang: 'typescript' },
  ];

  protected readonly states: BlockState[] = [
    { id: 'image', label: 'Con imagen' },
    { id: 'loading', label: 'Cargando' },
    { id: 'error', label: 'Con error' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'imageSrc',
      type: 'string | null',
      default: 'null',
      description: 'Tu imagen. Sin ella, un degradado neutro (provisional).',
    },
    {
      name: 'imageAlt',
      type: 'string',
      default: "''",
      description: 'Texto alternativo; vacío: la imagen es decorativa.',
    },
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
    {
      name: 'signupHref',
      type: 'string',
      default: "'#'",
      description: 'Enlace «Create an account».',
    },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    {
      name: 'submitted',
      type: '{ email, password }',
      default: '—',
      description: 'Formulario válido enviado (Login02Value).',
    },
    { name: 'sso', type: 'void', default: '—', description: 'Se pulsó «Sign in with SSO».' },
  ];
}
