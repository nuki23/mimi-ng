import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dropdown-menu-checkbox-radio-example',
  imports: [MimiDropdownMenuImports, MimiButton],
  template: `
    <div class="flex flex-col items-start gap-3">
      <mimi-dropdown-menu>
        <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Vista</button>
        <ng-template mimiDropdownMenuContent>
          <mimi-menu-label>Paneles</mimi-menu-label>
          <mimi-menu-checkbox-item [(checked)]="sidebar" shortcut="⌘\\">
            Barra lateral
          </mimi-menu-checkbox-item>
          <mimi-menu-checkbox-item [(checked)]="minimap">Minimapa</mimi-menu-checkbox-item>
          <mimi-menu-separator />
          <mimi-menu-label>Ordenar por</mimi-menu-label>
          <mimi-menu-radio-group [(value)]="order" aria-label="Ordenar por">
            <mimi-menu-radio-item value="name">Nombre</mimi-menu-radio-item>
            <mimi-menu-radio-item value="date">Fecha</mimi-menu-radio-item>
            <mimi-menu-radio-item value="size">Tamaño</mimi-menu-radio-item>
          </mimi-menu-radio-group>
        </ng-template>
      </mimi-dropdown-menu>
      <p class="text-sm text-muted-foreground">
        Barra lateral: {{ sidebar() ? 'sí' : 'no' }} · Minimapa: {{ minimap() ? 'sí' : 'no' }} ·
        Orden: {{ order() }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuCheckboxRadioExample {
  protected readonly sidebar = signal(true);
  protected readonly minimap = signal(false);
  protected readonly order = signal('name');
}
