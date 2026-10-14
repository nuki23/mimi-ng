import { ChangeDetectionStrategy, Component, TemplateRef, viewChild } from '@angular/core';
import { LucideArchive } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { injectMimiToast } from '@/components/ui/toast';

@Component({
  selector: 'app-toast-tones-example',
  imports: [MimiButton, LucideArchive],
  template: `
    <div class="flex flex-wrap justify-center gap-2">
      <button mimiBtn variant="outline" (click)="success()">Success</button>
      <button mimiBtn variant="outline" (click)="warning()">Warning</button>
      <button mimiBtn variant="outline" (click)="info()">Info</button>
      <button mimiBtn variant="outline" (click)="error()">Error</button>
      <button mimiBtn variant="outline" (click)="archive()">Ícono propio</button>
    </div>
    <ng-template #archiveIcon><svg lucideArchive></svg></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastTonesExample {
  private readonly toast = injectMimiToast();
  private readonly archiveIcon = viewChild.required<TemplateRef<unknown>>('archiveIcon');

  protected success(): void {
    this.toast.success('Cambios guardados', {
      description: 'panel-ventas se publicó correctamente.',
    });
  }

  protected warning(): void {
    this.toast.warning('Tu prueba termina pronto', {
      description: 'Quedan 3 días del plan Equipo.',
    });
  }

  protected info(): void {
    this.toast.info('Nueva versión disponible', {
      description: 'Mimi 0.2.0 trae Select y Dialog.',
    });
  }

  protected error(): void {
    // error usa el tono danger y el lector de pantalla lo anuncia con prioridad.
    this.toast.error('No se pudo guardar', {
      description: 'Revisa tu conexión e inténtalo de nuevo.',
    });
  }

  protected archive(): void {
    this.toast('Conversación archivada', {
      description: 'Se movió a Archivados.',
      icon: this.archiveIcon(),
      action: { label: 'Deshacer', onClick: () => this.toast('Conversación restaurada') },
    });
  }
}
