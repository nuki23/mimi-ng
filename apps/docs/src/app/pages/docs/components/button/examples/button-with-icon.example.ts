import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideMail, LucideSettings } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-with-icon-example',
  imports: [MimiButton, LucideMail, LucideSettings],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button mimiBtn>
        <svg lucideMail></svg>
        Enviar correo
      </button>
      <button mimiBtn variant="outline" size="icon" aria-label="Ajustes">
        <svg lucideSettings></svg>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonWithIconExample {}
