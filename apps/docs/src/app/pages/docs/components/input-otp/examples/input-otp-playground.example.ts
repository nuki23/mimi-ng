import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiInputOtp } from '@/components/ui/input-otp';
import { MimiNumberInput } from '@/components/ui/number-input';
import { MimiSelectImports } from '@/components/ui/select';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

/** Grupos: cada cuántas casillas va el separador. */
const GROUPS = [
  { id: 'none', label: 'Sin grupos' },
  { id: 'half', label: 'En dos mitades' },
  { id: '2', label: 'De 2 en 2' },
  { id: '3', label: 'De 3 en 3' },
  { id: '4', label: 'De 4 en 4' },
];

@Component({
  selector: 'app-input-otp-playground-example',
  imports: [MimiInputOtp, MimiNumberInput, MimiSelectImports, MimiToggleGroupImports],
  template: `
    <div class="flex w-full max-w-2xl flex-col gap-6">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="flex flex-col gap-1.5">
          <label for="otp-length" class="text-sm font-medium">Casillas</label>
          <mimi-number-input id="otp-length" [min]="1" [max]="12" [(value)]="length" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="otp-groups" class="text-sm font-medium">Grupos</label>
          <mimi-select id="otp-groups" [(value)]="groups">
            @for (g of groupOptions; track g.id) {
              <mimi-option [value]="g.id">{{ g.label }}</mimi-option>
            }
          </mimi-select>
        </div>
        <div class="flex flex-col gap-1.5">
          <span id="otp-sep" class="text-sm font-medium">Separador</span>
          <mimi-toggle-group aria-labelledby="otp-sep" [(value)]="separator">
            <button mimiToggleGroupItem="bar">Guion</button>
            <button mimiToggleGroupItem="·">·</button>
            <button mimiToggleGroupItem="/">/</button>
          </mimi-toggle-group>
        </div>
      </div>

      <mimi-input-otp
        aria-label="Código"
        [length]="safeLength()"
        [separatorAfter]="after()"
        [separator]="separatorText()"
        [(value)]="code"
      />

      <pre
        class="overflow-x-auto rounded-[var(--mimi-radius-sm)] bg-muted px-3 py-2 font-mono text-[13px] text-muted-foreground"
      ><code>{{ snippet() }}</code></pre>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpPlaygroundExample {
  protected readonly groupOptions = GROUPS;
  protected readonly length = signal<number | null>(8);
  protected readonly groups = signal<string | null>('half');
  protected readonly separator = signal<string | null>('bar');
  protected readonly code = signal('');
  /** El guion del diseño es sin `separator`; los otros, el carácter. */
  protected readonly separatorText = computed(() => {
    const s = this.separator();
    return !s || s === 'bar' ? '' : s;
  });

  protected readonly safeLength = computed(() => Math.min(12, Math.max(1, this.length() ?? 6)));

  /** Las posiciones del separador: `[4]` en dos mitades de 8, `[4, 8]` de 4 en 4 con 12… */
  protected readonly after = computed(() => {
    const length = this.safeLength();
    const groups = this.groups();
    if (!groups || groups === 'none') return [];
    const step = groups === 'half' ? Math.ceil(length / 2) : Number(groups);
    const positions: number[] = [];
    for (let i = step; i < length; i += step) positions.push(i);
    return positions;
  });

  protected readonly snippet = computed(() => {
    const after = this.after();
    const parts = [`[length]="${this.safeLength()}"`];
    if (after.length) parts.push(`[separatorAfter]="[${after.join(', ')}]"`);
    if (this.separatorText()) parts.push(`separator="${this.separatorText()}"`);
    return `<mimi-input-otp ${parts.join(' ')} />`;
  });
}
