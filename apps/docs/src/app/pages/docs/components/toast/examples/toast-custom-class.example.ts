import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiToast } from '@/components/ui/toast';

@Component({
  selector: 'app-toast-custom-class-example',
  imports: [MimiButton],
  template: `<button mimiBtn variant="outline" (click)="show()">Invitar</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastCustomClassExample {
  private readonly toast = injectMimiToast();

  protected show(): void {
    this.toast.success('Invitación enviada', {
      description: 'Ana recibirá un correo.',
      // class va al toast y gana: aquí, más redondeado y con el borde del tono.
      class: 'rounded-2xl border-success-border',
    });
  }
}
