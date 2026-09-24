import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-button-states-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <button mimiBtn disabled>Deshabilitado</button>
      <button mimiBtn [loading]="saving()" (click)="save()">Guardar</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonStatesExample {
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 2000);
  }
}
