import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-link-example',
  imports: [MimiCardImports],
  template: `
    <div class="grid w-full gap-4 sm:grid-cols-2">
      <a mimiCard interactive href="#card-link" class="block p-5">
        <span class="block font-semibold">Guía de inicio</span>
        <span class="block text-sm text-muted-foreground">La tarjeta entera es un enlace.</span>
      </a>
      <button
        mimiCard
        interactive
        type="button"
        class="block p-5"
        [attr.aria-pressed]="chosen()"
        (click)="chosen.set(!chosen())"
      >
        <span class="block font-semibold">Plan anual</span>
        <span class="block text-sm text-muted-foreground">
          {{ chosen() ? 'Elegido' : 'Pulsa para elegirlo' }}
        </span>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkExample {
  protected readonly chosen = signal(false);
}
