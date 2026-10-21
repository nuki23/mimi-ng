import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiContextMenuImports } from '@/components/ui/context-menu';

@Component({
  selector: 'app-context-menu-disabled-example',
  imports: [MimiContextMenuImports, MimiButton],
  template: `
    <div class="flex w-full flex-col items-start gap-3">
      <button mimiBtn variant="outline" size="sm" (click)="disabled.set(!disabled())">
        {{ disabled() ? 'Activar' : 'Desactivar' }} el menú
      </button>
      <mimi-context-menu aria-label="Menú del texto" [disabled]="disabled()">
        <div
          mimiContextMenuTrigger
          tabindex="0"
          class="flex h-44 w-full cursor-context-menu items-center justify-center rounded-card border border-dashed border-input bg-muted px-6 text-center text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          @if (disabled()) {
            Desactivado: el clic derecho muestra el menú del navegador (copiar, buscar…)
          } @else {
            Activado: el clic derecho muestra el menú de Mimi
          }
        </div>
        <ng-template mimiContextMenuContent>
          <mimi-menu-item>Copiar</mimi-menu-item>
          <mimi-menu-item>Comentar</mimi-menu-item>
        </ng-template>
      </mimi-context-menu>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuDisabledExample {
  protected readonly disabled = signal(true);
}
