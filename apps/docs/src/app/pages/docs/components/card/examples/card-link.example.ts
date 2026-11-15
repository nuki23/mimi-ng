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
        <!-- El nombre no cambia: el estado lo dice aria-pressed; la marca es solo visual. -->
        <span class="flex items-center justify-between font-semibold">
          Plan anual
          <span aria-hidden="true" class="text-primary" [class.invisible]="!chosen()">✓</span>
        </span>
        <span class="block text-sm text-muted-foreground">Facturación una vez al año.</span>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardLinkExample {
  protected readonly chosen = signal(false);
}
