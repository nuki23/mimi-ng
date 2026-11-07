import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSortableListImports } from '@/components/ui/sortable-list';

@Component({
  selector: 'app-sortable-list-simple-example',
  imports: [MimiSortableListImports],
  template: `
    <div class="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <span id="steps-label" class="text-sm font-medium">Pasos (solo texto)</span>
        <mimi-sortable-list aria-labelledby="steps-label" [(items)]="steps" />
        <span class="text-xs text-muted-foreground">{{ steps().join(' → ') }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <span id="locked-label" class="text-sm font-medium">Deshabilitada</span>
        <mimi-sortable-list
          aria-labelledby="locked-label"
          disabled
          class="[--mimi-sortable-item-height:44px] [--mimi-sortable-gap:4px]"
          [items]="locked"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableListSimpleExample {
  protected readonly steps = signal(['Diseñar', 'Construir', 'Probar', 'Publicar']);
  protected readonly locked = ['Primero', 'Segundo', 'Tercero'];
}
