import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dropdown-menu-basic-example',
  imports: [MimiDropdownMenuImports, MimiButton],
  template: `
    <div class="flex flex-col items-start gap-3">
      <mimi-dropdown-menu class="w-52">
        <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Opciones</button>
        <ng-template mimiDropdownMenuContent>
          <mimi-menu-item (selected)="last.set('Editar')">Editar</mimi-menu-item>
          <mimi-menu-item (selected)="last.set('Duplicar')">Duplicar</mimi-menu-item>
          <mimi-menu-item (selected)="last.set('Archivar')">Archivar</mimi-menu-item>
          <mimi-menu-item disabled>Mover a otro equipo</mimi-menu-item>
        </ng-template>
      </mimi-dropdown-menu>
      <p class="text-sm text-muted-foreground">Elegiste: {{ last() ?? '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuBasicExample {
  protected readonly last = signal<string | null>(null);
}
