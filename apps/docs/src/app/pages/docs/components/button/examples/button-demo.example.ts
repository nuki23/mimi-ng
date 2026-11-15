import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-demo-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button mimiBtn variant="outline">Cancelar</button>
      <button mimiBtn variant="soft" tone="danger">Eliminar</button>
      <button mimiBtn [loading]="saving()" (click)="save()">Guardar</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDemoExample {
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 2000);
  }
}
