import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { type MimiOption, MimiSelect } from '@/components/ui/select';
import { MIMI_PAGINATION_TEXT } from './pagination-texts';

/**
 * Uso interno de Pagination (se exporta porque el compilador lo exige): el selector de registros
 * por página. Va en su propio archivo para que Pagination lo cargue con `@defer`: Select, aria y el
 * overlay solo llegan si hay `pageSizeOptions`.
 */
@Component({
  selector: 'mimi-pagination-page-size',
  imports: [MimiSelect],
  template: `
    <mimi-select
      side="top"
      align="end"
      [matchWidth]="false"
      [options]="selectOptions()"
      [(value)]="selected"
      [aria-label]="text.pageSize"
      [class]="triggerClasses()"
      panelClass="min-w-[120px] [--mimi-select-option-height:30px]"
      (valueChange)="onChange($event)"
    />
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiPaginationPageSize {
  protected readonly text = inject(MIMI_PAGINATION_TEXT);

  readonly options = input.required<readonly number[]>();
  readonly value = input.required<number>();
  readonly size = input<'sm' | 'md'>('sm');
  /** Mientras está deshabilitado, una elección se descarta (sin `disabled` nativo: no se pierde el foco). */
  readonly blocked = input(false);
  readonly changed = output<number>();

  /** Lo que muestra Select; vuelve al valor de Pagination si se descarta una elección. */
  protected readonly selected = linkedSignal<number | null>(() => this.value());

  protected readonly selectOptions = computed<MimiOption<number>[]>(() =>
    this.options().map((size) => ({ value: size, label: this.text.pageSizeOption(size) })),
  );

  protected readonly triggerClasses = computed(() =>
    [
      // El botón «10 / pág.» del diseño: sin borde, transparente, redondo y del alto de los demás.
      'w-auto gap-1 rounded-full border-0 bg-transparent pr-2 pl-2.5 font-semibold tabular-nums',
      'hover:bg-accent data-[state=open]:bg-accent has-[[role=combobox]:active]:scale-95',
      // El chevron mira hacia arriba (el panel abre arriba) y mide 14px.
      '[&>svg:last-child]:size-3.5 [&>svg:last-child]:-scale-y-100',
      this.size() === 'md'
        ? 'h-[var(--mimi-pagination-item-size,var(--mimi-control-height,2.5rem))] text-sm'
        : 'h-[var(--mimi-pagination-item-size,var(--mimi-control-height-sm,2rem))] text-[13px]',
    ].join(' '),
  );

  protected onChange(size: number | null): void {
    if (size === null || this.blocked()) {
      this.selected.set(this.value());
      return;
    }
    this.changed.emit(size);
  }
}
