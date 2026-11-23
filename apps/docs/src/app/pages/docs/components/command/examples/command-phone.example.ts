import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCommandImports, type MimiCommandItem } from '@/components/ui/command';

@Component({
  selector: 'app-command-phone-example',
  imports: [MimiCommandImports, MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn variant="outline" type="button" (click)="open.set(true)">Ir a…</button>
      <p class="text-sm text-muted-foreground">Elegiste: {{ last() ?? '—' }}</p>
    </div>
    <!-- Debajo de 640 px es lo de siempre; presentation="fullscreen" lo pide también aquí. -->
    <!-- shortcut="": sin ⌘K, que ya usa el otro ejemplo de la página. -->
    <mimi-command-dialog
      aria-label="Ir a una página"
      presentation="fullscreen"
      shortcut=""
      placeholder="Busca una página…"
      [items]="pages"
      [(open)]="open"
      (run)="last.set($event.label)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPhoneExample {
  protected readonly open = signal(false);
  protected readonly last = signal<string | null>(null);
  protected readonly pages: MimiCommandItem[] = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'ajustes', label: 'Ajustes' },
  ];
}
