import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-as-link-example',
  imports: [MimiButton, RouterLink],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <a mimiBtn variant="outline" routerLink="/docs/installation">Instalación</a>
      <a mimiBtn variant="outline" routerLink="/docs/installation" disabled>No disponible</a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonAsLinkExample {}
