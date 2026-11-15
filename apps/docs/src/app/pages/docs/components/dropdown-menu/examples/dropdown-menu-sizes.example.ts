import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dropdown-menu-sizes-example',
  imports: [MimiDropdownMenuImports, MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      <mimi-dropdown-menu size="sm">
        <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Pequeño (sm)</button>
        <ng-template mimiDropdownMenuContent>
          <mimi-menu-item>Editar</mimi-menu-item>
          <mimi-menu-item>Duplicar</mimi-menu-item>
          <mimi-menu-item>Archivar</mimi-menu-item>
        </ng-template>
      </mimi-dropdown-menu>
      <mimi-dropdown-menu>
        <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Normal (md)</button>
        <ng-template mimiDropdownMenuContent>
          <mimi-menu-item>Editar</mimi-menu-item>
          <mimi-menu-item>Duplicar</mimi-menu-item>
          <mimi-menu-item>Archivar</mimi-menu-item>
        </ng-template>
      </mimi-dropdown-menu>
      <mimi-dropdown-menu size="lg">
        <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Grande (lg)</button>
        <ng-template mimiDropdownMenuContent>
          <mimi-menu-item>Editar</mimi-menu-item>
          <mimi-menu-item>Duplicar</mimi-menu-item>
          <mimi-menu-item>Archivar</mimi-menu-item>
        </ng-template>
      </mimi-dropdown-menu>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuSizesExample {}
