import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/otp-01/otp-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/otp-01/otp-01.html' with { loader: 'text' };
// @ts-expect-error
import indexSource from '@/blocks/otp-01/index' with { loader: 'text' };

/** Página del Block otp-01 (B.5). */
@Component({
  selector: 'app-otp-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="otp-01"
      description="Verificación con un código de 6 dígitos (Input OTP), con reenvío y cuenta regresiva. Encaja después del registro o del inicio de sesión."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">verify</code>
        sale con el código al completar los dígitos o al pulsar «Verify», una sola vez por código.
        Tu app lo comprueba y responde con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">status</code>
        (vale para ese código: al escribir otro, vuelve a «idle»). En la vista previa, una
        verificación de mentira acepta <strong>246810</strong>.
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          El foco empieza en el código, salvo que ya esté en otro lugar (por ejemplo, si el Block
          está en un diálogo); <code class="font-mono text-[13px]">[autofocus]="false"</code> lo
          apaga.
        </li>
        <li>El mensaje del código es un role="status" que describe el campo.</li>
        <li>
          El botón de reenvío lleva el tiempo en su texto; la cuenta no se anuncia cada segundo,
          solo cuando se puede pedir otro código.
        </li>
        <li>
          El código se puede pegar entero y el sistema puede proponerlo desde el SMS (<code
            class="font-mono text-[13px]"
            >one-time-code</code
          >, de Input OTP).
        </li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Otp01Page {
  protected readonly usage = [
    "import { Otp01 } from './blocks/otp-01';",
    '',
    '<mimi-otp-01',
    '  [destination]="otp.maskedEmail()"',
    '  [status]="otp.status()"',
    '  [loading]="otp.checking()"',
    '  (verify)="otp.check($event)"',
    '  (resend)="otp.send()"',
    '  (changeDestination)="router.navigate([\'/signup\'])"',
    '/>',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'input-otp', path: '/docs/components/input-otp' },
    { name: 'button', path: '/docs/components/button' },
    { name: 'card', path: '/docs/components/card' },
  ];

  protected readonly files: BlockFile[] = [
    { name: 'otp-01/otp-01.ts', code: tsSource as string, lang: 'angular-ts' },
    { name: 'otp-01/otp-01.html', code: htmlSource as string, lang: 'angular-html' },
    { name: 'otp-01/index.ts', code: indexSource as string, lang: 'typescript' },
  ];

  protected readonly states: BlockState[] = [{ id: 'resend', label: 'Reenvío disponible' }];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'destination',
      type: 'string',
      default: "'a••••@company.com'",
      description: 'El correo o teléfono, ya enmascarado, que se muestra.',
    },
    { name: 'length', type: 'number', default: '6', description: 'Dígitos del código.' },
    {
      name: 'resendSeconds',
      type: 'number',
      default: '60',
      description: 'Segundos hasta poder pedir otro código.',
    },
    {
      name: 'status',
      type: "'idle' | 'error' | 'success'",
      default: "'idle'",
      description:
        'El resultado del último código enviado por verify. Tras un error se puede reintentar el mismo código; si respondes otra vez con el mismo status, pon loading mientras compruebas (así el error viejo no se ve antes de tu respuesta).',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Mientras compruebas el código: «Verifying…» y no envía otro.',
    },
    {
      name: 'autofocus',
      type: 'boolean',
      default: 'true',
      description: 'Foco en el código al aparecer (no si el foco ya está en otro lugar).',
    },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    {
      name: 'verify',
      type: 'string',
      default: '—',
      description: 'El código completo, una sola vez por código.',
    },
    { name: 'resend', type: 'void', default: '—', description: 'Se pidió otro código.' },
    {
      name: 'changeDestination',
      type: 'void',
      default: '—',
      description: 'Se pulsó «Use another email».',
    },
  ];
}
