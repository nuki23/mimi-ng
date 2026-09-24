import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-input-custom-class-example',
  imports: [MimiInput],
  template: `
    <input
      mimiInput
      class="w-80 rounded-full bg-muted px-5"
      placeholder="Buscar en la documentación"
      aria-label="Buscar en la documentación"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCustomClassExample {}
