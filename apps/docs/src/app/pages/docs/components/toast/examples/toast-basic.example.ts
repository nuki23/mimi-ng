import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiToast } from '@/components/ui/toast';

@Component({
  selector: 'app-toast-basic-example',
  imports: [MimiButton],
  template: `<button mimiBtn variant="outline" (click)="show()">Crear evento</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastBasicExample {
  // Se llama al declarar la propiedad: necesita el contexto de inyección.
  private readonly toast = injectMimiToast();

  protected show(): void {
    this.toast('Evento creado', { description: 'Viernes 3 de octubre, 10:00' });
  }
}
