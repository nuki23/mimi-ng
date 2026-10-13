import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideLink, LucideMail, LucideMessageSquare, LucideUserPlus } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dropdown-menu-submenu-example',
  imports: [
    MimiDropdownMenuImports,
    MimiButton,
    LucideLink,
    LucideMail,
    LucideMessageSquare,
    LucideUserPlus,
  ],
  template: `
    <mimi-dropdown-menu>
      <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Equipo</button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-item>Ver miembros</mimi-menu-item>
        <mimi-menu-sub>
          <mimi-menu-sub-trigger>
            <svg lucideUserPlus></svg>
            Invitar personas
          </mimi-menu-sub-trigger>
          <ng-template mimiMenuSubContent>
            <mimi-menu-item>
              <svg lucideMail></svg>
              Por correo
            </mimi-menu-item>
            <mimi-menu-item>
              <svg lucideMessageSquare></svg>
              Por mensaje
            </mimi-menu-item>
            <mimi-menu-separator />
            <mimi-menu-item>
              <svg lucideLink></svg>
              Copiar enlace
            </mimi-menu-item>
          </ng-template>
        </mimi-menu-sub>
        <mimi-menu-item>Permisos</mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuSubmenuExample {}
