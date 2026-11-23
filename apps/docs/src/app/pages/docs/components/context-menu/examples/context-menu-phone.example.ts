import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiContextMenuImports } from '@/components/ui/context-menu';

@Component({
  selector: 'app-context-menu-phone-example',
  imports: [MimiContextMenuImports],
  template: `
    <div class="flex w-full flex-col gap-3">
      <!-- Debajo de 640 px es lo de siempre; presentation="sheet" la pide también aquí. -->
      <!-- En el teléfono se abre manteniendo el dedo; la hoja sale abajo, no en el punto. -->
      <mimi-context-menu aria-label="Acciones de la foto" presentation="sheet">
        <div
          mimiContextMenuTrigger
          tabindex="0"
          class="flex h-32 cursor-context-menu items-center justify-center rounded-card border border-dashed border-input bg-muted text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Clic derecho o mantén pulsado
        </div>
        <ng-template mimiContextMenuContent>
          <mimi-menu-item (selected)="last.set('Guardar')">Guardar</mimi-menu-item>
          <mimi-menu-item (selected)="last.set('Compartir')">Compartir</mimi-menu-item>
          <mimi-menu-item tone="danger" (selected)="last.set('Borrar')">Borrar</mimi-menu-item>
        </ng-template>
      </mimi-context-menu>
      <p class="text-sm text-muted-foreground">Elegiste: {{ last() ?? '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuPhoneExample {
  protected readonly last = signal<string | null>(null);
}
