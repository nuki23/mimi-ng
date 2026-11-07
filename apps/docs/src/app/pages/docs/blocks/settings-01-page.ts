import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/settings-01/settings-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/settings-01/settings-01.html' with { loader: 'text' };
// @ts-expect-error
import indexSource from '@/blocks/settings-01/index' with { loader: 'text' };

/** Página del Block settings-01 (B.6). */
@Component({
  selector: 'app-settings-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="settings-01"
      description="Ajustes de cuenta de un producto SaaS: perfil, notificaciones, seguridad y facturación, con navegación lateral (pestañas verticales; píldoras en móvil) y una barra de «cambios sin guardar»."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Dale tus datos con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">profile</code>,
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">preferences</code>,
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">sessions</code> y
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">plan</code> (sin
        ellos, los del ejemplo). La barra aparece cuando el formulario es distinto de esos datos y
        se va al volver a ellos, al descartar o al guardar. «Delete account» y «Save» son salidas:
        el Block no confirma ni avisa; aquí, cómo enchufarle
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">mimi-confirm</code>
        y un Toast.
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          Una sola lista de pestañas: vertical en escritorio (↑/↓) y horizontal en móvil (←/→);
          cambia en vivo con el ancho.
        </li>
        <li>
          Cada interruptor se nombra con su título y su descripción lo describe (<code
            class="font-mono text-[13px]"
            >aria-describedby</code
          >).
        </li>
        <li>
          El contador de la biografía describe el campo y no se anuncia con cada tecla. La barra de
          cambios es un <code class="font-mono text-[13px]">role="status"</code>.
        </li>
        <li>La barra de asientos es un Progress con su nombre («Seats used»).</li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings01Page {
  protected readonly usage = [
    "import { Settings01, type Settings01Value } from './blocks/settings-01';",
    "import { injectMimiConfirm } from '@/components/ui/confirm';",
    "import { injectMimiToast } from '@/components/ui/toast';",
    '',
    '@Component({',
    '  imports: [Settings01],',
    '  template: `<mimi-settings-01',
    '    [profile]="account.profile()"',
    '    [saving]="saving()"',
    '    (saved)="save($event)"',
    '    (deleteAccount)="remove()"',
    '  />`,',
    '})',
    'export class SettingsPage {',
    '  private readonly confirm = injectMimiConfirm();',
    '  private readonly toast = injectMimiToast();',
    '  readonly saving = signal(false);',
    '',
    '  async save(value: Settings01Value) {',
    '    this.saving.set(true);',
    '    await this.account.update(value);',
    '    this.saving.set(false);',
    "    this.toast.success('Changes saved');",
    '  }',
    '',
    '  async remove() {',
    '    const ok = await this.confirm({',
    "      title: 'Delete your account?',",
    "      description: 'Your data is deleted after 30 days.',",
    "      tone: 'danger',",
    '    });',
    '    if (ok) await this.account.delete();',
    '  }',
    '}',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'tabs', path: '/docs/components/tabs' },
    { name: 'input', path: '/docs/components/input' },
    { name: 'textarea', path: '/docs/components/input' },
    { name: 'switch', path: '/docs/components/switch' },
    { name: 'avatar', path: '/docs/components/avatar' },
    { name: 'badge', path: '/docs/components/badge' },
    { name: 'progress', path: '/docs/components/progress' },
    { name: 'button', path: '/docs/components/button' },
    { name: 'card', path: '/docs/components/card' },
    { name: 'separator', path: '/docs/components/separator' },
    { name: 'form-field', path: '/docs/components/form-field' },
  ];

  protected readonly files: BlockFile[] = [
    { name: 'settings-01/settings-01.ts', code: tsSource as string, lang: 'angular-ts' },
    { name: 'settings-01/settings-01.html', code: htmlSource as string, lang: 'angular-html' },
    { name: 'settings-01/index.ts', code: indexSource as string, lang: 'typescript' },
  ];

  protected readonly states: BlockState[] = [
    { id: 'notifications', label: 'Notificaciones' },
    { id: 'security', label: 'Seguridad' },
    { id: 'billing', label: 'Facturación' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'profile',
      type: 'Settings01Profile',
      default: 'el del ejemplo',
      description: 'Nombre, usuario, biografía, iniciales y foto (avatarSrc).',
    },
    {
      name: 'preferences',
      type: 'Settings01Preferences',
      default: 'el del ejemplo',
      description: 'Los interruptores de las tres secciones.',
    },
    {
      name: 'sessions',
      type: 'Settings01Session[]',
      default: 'dos de ejemplo',
      description: 'Dispositivo, lugar y hora; current marca «This session».',
    },
    {
      name: 'plan',
      type: 'Settings01Plan',
      default: 'el del ejemplo',
      description: 'Plan, precio por persona (con Intl y LOCALE_ID), asientos, tarjeta y factura.',
    },
    {
      name: 'saving',
      type: 'boolean',
      default: 'false',
      description: 'Mientras guardas: «Saving…».',
    },
    {
      name: 'tab',
      type: "'profile' | 'notifications' | 'security' | 'billing'",
      default: "'profile'",
      description: 'La sección elegida. Admite [(tab)].',
    },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    {
      name: 'saved',
      type: 'Settings01Value',
      default: '—',
      description: 'El formulario válido al pulsar «Save».',
    },
    { name: 'avatarChange', type: 'void', default: '—', description: '«Change photo».' },
    { name: 'avatarRemove', type: 'void', default: '—', description: '«Remove».' },
    {
      name: 'sessionEnd',
      type: 'string',
      default: '—',
      description: '«Sign out» en una sesión: su id.',
    },
    {
      name: 'deleteAccount',
      type: 'void',
      default: '—',
      description: '«Delete account». Confírmalo en tu app.',
    },
    { name: 'changePlan', type: 'void', default: '—', description: '«Change plan».' },
  ];
}
