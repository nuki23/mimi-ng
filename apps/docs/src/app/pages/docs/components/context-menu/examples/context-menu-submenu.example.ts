import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCode, LucidePrinter, LucideSave, LucideWrench } from '@lucide/angular';
import { MimiContextMenuImports } from '@/components/ui/context-menu';

@Component({
  selector: 'app-context-menu-submenu-example',
  imports: [MimiContextMenuImports, LucideCode, LucidePrinter, LucideSave, LucideWrench],
  template: `
    <mimi-context-menu aria-label="Menú de la página">
      <div
        mimiContextMenuTrigger
        tabindex="0"
        class="flex h-44 w-full cursor-context-menu items-center justify-center rounded-card border border-dashed border-input bg-muted text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Clic derecho, o Shift+F10 con el foco aquí
      </div>
      <ng-template mimiContextMenuContent>
        <mimi-menu-item shortcut="⌘S">
          <svg lucideSave></svg>
          Guardar como…
        </mimi-menu-item>
        <mimi-menu-item shortcut="⌘P">
          <svg lucidePrinter></svg>
          Imprimir
        </mimi-menu-item>
        <mimi-menu-separator />
        <mimi-menu-sub>
          <mimi-menu-sub-trigger>
            <svg lucideWrench></svg>
            Más herramientas
          </mimi-menu-sub-trigger>
          <ng-template mimiMenuSubContent>
            <mimi-menu-item>Crear acceso directo…</mimi-menu-item>
            <mimi-menu-item>Nombrar ventana…</mimi-menu-item>
            <mimi-menu-separator />
            <mimi-menu-item>
              <svg lucideCode></svg>
              Herramientas para desarrolladores
            </mimi-menu-item>
          </ng-template>
        </mimi-menu-sub>
      </ng-template>
    </mimi-context-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuSubmenuExample {}
