import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';

@Component({
  selector: 'app-checkbox-demo-example',
  imports: [MimiButton, MimiCheckbox],
  template: `
    <div class="flex flex-col gap-4">
      <mimi-checkbox [(checked)]="news">Enviarme novedades por correo</mimi-checkbox>
      <mimi-checkbox [(checked)]="terms">
        Acepto los términos y la política de privacidad
      </mimi-checkbox>
      <button mimiBtn type="button" class="self-start" [disabled]="!terms()">Crear cuenta</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDemoExample {
  protected readonly news = signal(true);
  protected readonly terms = signal(false);
}
