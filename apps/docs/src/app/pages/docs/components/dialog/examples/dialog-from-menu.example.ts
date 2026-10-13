import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports } from '@/components/ui/dialog';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dialog-from-menu-example',
  imports: [MimiDialogImports, MimiDropdownMenuImports, MimiButton],
  template: `
    <mimi-dropdown-menu>
      <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Proyecto</button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-item (selected)="details.set(true)">Ver detalles…</mimi-menu-item>
        <mimi-menu-item>Duplicar</mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>

    <!-- Sin trigger: lo abre el ítem del menú con [(open)]. -->
    <mimi-dialog [(open)]="details">
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Sitio web</h2>
          <p mimiDialogDescription>Creado el 3 de marzo por Ana Torres.</p>
        </mimi-dialog-header>
        <mimi-dialog-body>
          <p class="text-sm text-pretty">12 páginas, 3 personas y 48 cambios este mes.</p>
        </mimi-dialog-body>
        <mimi-dialog-footer>
          <button mimiBtn type="button" mimiDialogClose>Cerrar</button>
        </mimi-dialog-footer>
      </ng-template>
    </mimi-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFromMenuExample {
  protected readonly details = signal(false);
}
