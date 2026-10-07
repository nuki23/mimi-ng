import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-tooltip-disabled-example',
  imports: [MimiTooltip, MimiButton, MimiSwitch],
  template: `
    <div class="flex flex-col items-center gap-4">
      <mimi-switch [(checked)]="hints">Mostrar ayudas</mimi-switch>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <button
          mimiBtn
          variant="outline"
          mimiTooltip="Ayuda opcional"
          [mimiTooltipDisabled]="!hints()"
        >
          Con mimiTooltipDisabled
        </button>
        <!-- Un botón deshabilitado no recibe el puntero ni el foco: el tooltip va en un envoltorio. -->
        <span
          tabindex="0"
          class="inline-flex rounded-[var(--mimi-radius)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          mimiTooltip="Completa el formulario para publicar"
        >
          <button mimiBtn disabled class="pointer-events-none">Publicar</button>
        </span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipDisabledExample {
  protected readonly hints = signal(true);
}
