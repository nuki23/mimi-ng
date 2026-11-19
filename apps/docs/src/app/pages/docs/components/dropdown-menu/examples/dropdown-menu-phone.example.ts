import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

@Component({
  selector: 'app-dropdown-menu-phone-example',
  imports: [MimiDropdownMenuImports, MimiButton],
  template: `
    <div class="flex flex-col items-start gap-3">
      <!-- Debajo de 640 px es lo de siempre; presentation="sheet" la pide también aquí. -->
      <!-- El submenú se abre como un nivel aparte, con «Atrás». -->
      <mimi-dropdown-menu presentation="sheet">
        <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Compartir</button>
        <ng-template mimiDropdownMenuContent>
          <mimi-menu-item (selected)="last.set('Copiar enlace')">Copiar enlace</mimi-menu-item>
          <mimi-menu-sub>
            <mimi-menu-sub-trigger>Enviar por</mimi-menu-sub-trigger>
            <ng-template mimiMenuSubContent>
              <mimi-menu-item (selected)="last.set('Correo')">Correo</mimi-menu-item>
              <mimi-menu-item (selected)="last.set('Mensaje')">Mensaje</mimi-menu-item>
            </ng-template>
          </mimi-menu-sub>
          <mimi-menu-item (selected)="last.set('Insertar')">Insertar en una página</mimi-menu-item>
        </ng-template>
      </mimi-dropdown-menu>
      <p class="text-sm text-muted-foreground">Elegiste: {{ last() ?? '—' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuPhoneExample {
  protected readonly last = signal<string | null>(null);
}
