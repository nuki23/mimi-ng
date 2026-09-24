import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-custom-class-example',
  imports: [MimiButton],
  template: `
    <div class="w-72">
      <button mimiBtn class="h-12 w-full rounded-full text-base">Crear cuenta</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonCustomClassExample {}
