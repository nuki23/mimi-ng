import { ChangeDetectionStrategy, Component, TemplateRef, signal, viewChild } from '@angular/core';
import { LucideTrash2 } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';

@Component({
  selector: 'app-confirm-danger-example',
  imports: [MimiButton, LucideTrash2],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn variant="outline" tone="danger" (click)="remove()">Eliminar proyecto</button>
      <p class="font-mono text-[13px] text-muted-foreground">resultado: {{ result() }}</p>
    </div>
    <!-- El ícono del círculo: una plantilla con un <svg>. -->
    <ng-template #trash><svg lucideTrash2></svg></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDangerExample {
  private readonly confirm = injectMimiConfirm();
  private readonly trash = viewChild.required<TemplateRef<unknown>>('trash');
  protected readonly result = signal('—');

  protected async remove(): Promise<void> {
    // tone="danger": el botón de confirmar va en rojo y el foco empieza en Cancelar.
    const ok = await this.confirm({
      title: '¿Eliminar este proyecto?',
      description:
        'Se eliminará «panel-ventas» con sus 24 componentes. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar proyecto',
      tone: 'danger',
      icon: this.trash(),
    });
    this.result.set(ok ? 'eliminado' : 'cancelado');
  }
}
