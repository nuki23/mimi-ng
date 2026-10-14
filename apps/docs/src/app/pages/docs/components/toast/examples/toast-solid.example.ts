import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiToast } from '@/components/ui/toast';

@Component({
  selector: 'app-toast-solid-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap justify-center gap-2">
      <button mimiBtn tone="success" (click)="success()">Success</button>
      <button mimiBtn tone="warning" (click)="warning()">Warning</button>
      <button mimiBtn tone="info" (click)="info()">Info</button>
      <button mimiBtn tone="danger" (click)="error()">Error</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastSolidExample {
  private readonly toast = injectMimiToast();

  protected success(): void {
    this.toast.success('Cambios guardados', {
      variant: 'solid',
      description: 'panel-ventas se publicó correctamente.',
    });
  }

  protected warning(): void {
    this.toast.warning('Tu prueba termina pronto', {
      variant: 'solid',
      description: 'Quedan 3 días del plan Equipo.',
    });
  }

  protected info(): void {
    this.toast.info('Nueva versión disponible', {
      variant: 'solid',
      description: 'Mimi 0.2.0 trae Select y Dialog.',
    });
  }

  protected error(): void {
    this.toast.error('No se pudo guardar', {
      variant: 'solid',
      description: 'Revisa tu conexión e inténtalo de nuevo.',
    });
  }
}
