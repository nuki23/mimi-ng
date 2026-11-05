import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

@Component({
  selector: 'app-toggle-group-forms-example',
  imports: [MimiToggleGroupImports, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="flex flex-col items-start gap-5 text-sm">
      <!-- Signal Forms: un campo string | null (simple) y otro string[] (múltiple). -->
      <div class="flex flex-col gap-2">
        <span class="font-medium">Signal Forms</span>
        <mimi-toggle-group aria-label="Talla" [formField]="order.size">
          <button mimiToggleGroupItem="s">S</button>
          <button mimiToggleGroupItem="m">M</button>
          <button mimiToggleGroupItem="l">L</button>
        </mimi-toggle-group>
        <mimi-toggle-group aria-label="Extras" multiple [formField]="order.extras">
          <button mimiToggleGroupItem="gift">Regalo</button>
          <button mimiToggleGroupItem="express">Envío exprés</button>
        </mimi-toggle-group>
        <span class="text-muted-foreground">
          {{ data().size ?? 'sin talla' }} · {{ data().extras.join(', ') || 'sin extras' }}
        </span>
      </div>

      <!-- Reactive Forms: requerido; al salir sin elegir, se marca el error. -->
      <div class="flex flex-col gap-2">
        <span class="font-medium">Reactive Forms</span>
        <mimi-toggle-group aria-label="Plan" [formControl]="plan">
          <button mimiToggleGroupItem="free">Gratis</button>
          <button mimiToggleGroupItem="pro">Pro</button>
        </mimi-toggle-group>
        <span class="text-muted-foreground">
          {{ plan.value ?? 'sin plan' }}{{ plan.invalid && plan.touched ? ' · elige un plan' : '' }}
        </span>
      </div>

      <!-- ngModel -->
      <div class="flex flex-col gap-2">
        <span class="font-medium">ngModel</span>
        <mimi-toggle-group aria-label="Vista" name="view" [(ngModel)]="view">
          <button mimiToggleGroupItem="list">Lista</button>
          <button mimiToggleGroupItem="grid">Cuadrícula</button>
        </mimi-toggle-group>
        <span class="text-muted-foreground">{{ view }}</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupFormsExample {
  protected readonly data = signal<{ size: string | null; extras: string[] }>({
    size: null,
    extras: [],
  });
  protected readonly order = form(this.data, (p) => required(p.size));
  protected readonly plan = new FormControl<string | null>(null, Validators.required);
  protected view = 'list';
}
