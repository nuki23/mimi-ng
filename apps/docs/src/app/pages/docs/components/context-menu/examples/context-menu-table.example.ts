import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideEllipsis } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiContextMenuImports } from '@/components/ui/context-menu';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

interface FileRow {
  id: number;
  name: string;
  size: string;
}

@Component({
  selector: 'app-context-menu-table-example',
  imports: [MimiContextMenuImports, MimiDropdownMenuImports, MimiButton, LucideEllipsis],
  template: `
    <div class="flex w-full flex-col gap-3">
      <mimi-context-menu label="Acciones del archivo">
        <table class="w-full text-left text-sm">
          <thead class="text-muted-foreground">
            <tr class="border-b">
              <th scope="col" class="px-3 py-2 font-medium">Nombre</th>
              <th scope="col" class="px-3 py-2 font-medium">Tamaño</th>
              <th scope="col" class="w-12 px-3 py-2"><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            @for (file of files; track file.id) {
              <tr
                mimiContextMenuTrigger
                [mimiContextMenuTriggerData]="file"
                class="border-b last:border-0 data-[state=open]:bg-accent"
              >
                <td class="px-3 py-2 font-medium">{{ file.name }}</td>
                <td class="px-3 py-2 text-muted-foreground">{{ file.size }}</td>
                <td class="px-3 py-1">
                  <!-- En táctil no hay clic derecho: las mismas acciones, en un botón. -->
                  <mimi-dropdown-menu align="end" [label]="'Acciones de ' + file.name">
                    <button
                      mimiBtn
                      variant="ghost"
                      size="icon"
                      class="size-8"
                      [attr.aria-label]="'Acciones de ' + file.name"
                      mimiDropdownMenuTrigger
                    >
                      <svg lucideEllipsis></svg>
                    </button>
                    <ng-template mimiDropdownMenuContent>
                      @for (action of actions; track action) {
                        @if (action === 'Eliminar') {
                          <mimi-menu-separator />
                        }
                        <mimi-menu-item
                          [tone]="action === 'Eliminar' ? 'danger' : 'default'"
                          (selected)="last.set(action + ' ' + file.name)"
                        >
                          {{ action }}
                        </mimi-menu-item>
                      }
                    </ng-template>
                  </mimi-dropdown-menu>
                </td>
              </tr>
            }
          </tbody>
        </table>
        <ng-template mimiContextMenuContent let-file>
          <mimi-menu-label>{{ file.name }}</mimi-menu-label>
          @for (action of actions; track action) {
            @if (action === 'Eliminar') {
              <mimi-menu-separator />
            }
            <mimi-menu-item
              [tone]="action === 'Eliminar' ? 'danger' : 'default'"
              (selected)="last.set(action + ' ' + file.name)"
            >
              {{ action }}
            </mimi-menu-item>
          }
        </ng-template>
      </mimi-context-menu>
      <p class="text-sm text-muted-foreground">Elegiste: {{ last() ?? '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuTableExample {
  protected readonly files: FileRow[] = [
    { id: 1, name: 'informe-anual.pdf', size: '2,4 MB' },
    { id: 2, name: 'fotos-equipo.zip', size: '118 MB' },
    { id: 3, name: 'presupuesto.xlsx', size: '86 kB' },
  ];
  protected readonly actions = ['Renombrar', 'Duplicar', 'Descargar', 'Eliminar'];
  protected readonly last = signal<string | null>(null);
}
