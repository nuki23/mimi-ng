import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/signup-01/signup-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/signup-01/signup-01.html' with { loader: 'text' };
import { pageFiles, pageInfo } from './page-code';

/** Página del Block signup-01 (B.4). */
@Component({
  selector: 'app-signup-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="signup-01"
      kind="page"
      description="Registro que guía mientras escribes: mensajes al salir de cada campo, el medidor de Password con sus reglas, confirmación de la contraseña y un botón que dice qué falta."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Es tu página: pega la línea en tus rutas y conecta
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">submitted</code>
        con tu registro. Escribe en la vista previa para ver los mensajes: aparecen al salir de cada
        campo y, una vez tocado, cambian mientras escribes. «Fuerte» son las cuatro reglas del
        medidor; el Block las pasa a
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >mimi-password</code
        >
        y las usa para su validador (una sola lista, con los textos de
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
          >provideMimiPasswordText</code
        >).
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          «Create account» no usa <code class="font-mono text-[13px]">disabled</code>: con
          <code class="font-mono text-[13px]">aria-disabled</code> sigue enfocable y su nota (lo que
          falta) está en su <code class="font-mono text-[13px]">aria-describedby</code>. Al pulsarlo
          incompleto, marca todo y lleva el foco al primer campo con error.
        </li>
        <li>
          Los mensajes de error y de «válido» describen su campo; el medidor anuncia el nivel.
        </li>
        <li>
          Las dos contraseñas llevan
          <code class="font-mono text-[13px]">autocomplete="new-password"</code>, para que el gestor
          proponga una.
        </li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup01Page {
  protected readonly usage = [
    '// app.routes.ts (la línea que te da ng g mimi)',
    pageInfo('signup-01').routeLine,
    '',
    '// O dentro de otra página tuya:',
    '<app-signup-page',
    '  [loading]="auth.loading()"',
    '  [error]="auth.error()"',
    '  termsHref="/terms"',
    '  privacyHref="/privacy"',
    '  signinHref="/login"',
    '  (submitted)="auth.signUp($event)"',
    '/>',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'input', path: '/docs/components/input' },
    { name: 'password', path: '/docs/components/password' },
    { name: 'checkbox', path: '/docs/components/checkbox' },
    { name: 'button', path: '/docs/components/button' },
    { name: 'form-field', path: '/docs/components/form-field' },
  ];

  /** Como los genera ng g mimi signup-01 (B.11). */
  protected readonly files: BlockFile[] = pageFiles(
    'signup-01',
    tsSource as string,
    htmlSource as string,
  );

  protected readonly states: BlockState[] = [
    { id: 'loading', label: 'Cargando' },
    { id: 'error', label: 'Con error' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Mientras creas la cuenta: «Creating account…» y no reenvía.',
    },
    {
      name: 'error',
      type: 'string | null',
      default: 'null',
      description: 'Error de tu servidor (correo ya registrado…), en un role="alert".',
    },
    { name: 'termsHref', type: 'string', default: "'#'", description: 'Enlace «Terms».' },
    {
      name: 'privacyHref',
      type: 'string',
      default: "'#'",
      description: 'Enlace «Privacy Notice».',
    },
    { name: 'signinHref', type: 'string', default: "'#'", description: 'Enlace «Sign in».' },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    {
      name: 'submitted',
      type: '{ name, email, password }',
      default: '—',
      description: 'Formulario completo enviado (SignupPageValue).',
    },
  ];
}
