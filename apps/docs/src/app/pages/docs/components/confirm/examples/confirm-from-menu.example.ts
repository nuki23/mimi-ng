import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-confirm-from-menu-example',
  imports: [MimiDropdownMenuImports, MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <mimi-dropdown-menu>
        <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Proyecto</button>
        <ng-template mimiDropdownMenuContent>
          <mimi-menu-item>Duplicar</mimi-menu-item>
          <mimi-menu-item tone="danger" (selected)="remove()">Eliminar…</mimi-menu-item>
        </ng-template>
      </mimi-dropdown-menu>
      <p class="font-mono text-[13px] text-muted-foreground">resultado: {{ result() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmFromMenuExample {
  private readonly confirm = injectMimiConfirm();
  protected readonly result = signal('—');

  protected async remove(): Promise<void> {
    // Al cerrar, el foco vuelve al botón del menú.
    const ok = await this.confirm({
      title: '¿Eliminar «Sitio web»?',
      description: 'Se borran sus 12 páginas. Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    this.result.set(ok ? 'eliminado' : 'cancelado');
  }
}
