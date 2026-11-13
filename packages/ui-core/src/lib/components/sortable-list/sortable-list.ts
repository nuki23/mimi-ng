import {
  CdkDrag,
  type CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
  type CdkDragStart,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  type EmbeddedViewRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  isDevMode,
  model,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import { MIMI_SORTABLE_TEXT } from './sortable-list-texts';

/*
 * Sortable List (docs/design/Mimi F4 Command Tree Sortable.dc.html, «3 · Sortable List»;
 * prefijo de tokens `sortable`, spec 13, G3.0).
 *
 * El puntero y el dedo usan @angular/cdk/drag-drop (spec 4): la lista es un `cdkDropList` con el
 * eje Y fijo y cada elemento un `cdkDrag` que se toma solo desde su asa. El teclado es propio
 * (el cdk no tiene, plan G3.2-d): Espacio o Enter en el asa agarran, ↑ ↓ Inicio Fin mueven,
 * Espacio o Enter sueltan y Escape cancela; cada paso se anuncia en la región del diseño.
 */

/** Contexto de `<ng-template mimiSortableItem let-item let-index="index">`. */
export interface MimiSortableItemContext<T = unknown> {
  $implicit: T;
  index: number;
  /** Agarrado con el teclado o arrastrándose. */
  grabbed: boolean;
}

/** Lo que emite `reordered` al soltar un elemento en otro lugar. */
export interface MimiSortableReorder<T = unknown> {
  item: T;
  previousIndex: number;
  currentIndex: number;
}

/**
 * Contenido de cada elemento (todo lo que va al lado del asa):
 *
 * ```html
 * <ng-template mimiSortableItem let-task let-index="index">…</ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[mimiSortableItem]' })
// `any` por defecto: el tipo de `items` no llega al `ng-template` (Angular no lo infiere), y con
// `unknown` la plantilla del usuario no podría leer `task.title` con strictTemplates.
export class MimiSortableItemTemplate<T = any> {
  readonly template = inject<TemplateRef<MimiSortableItemContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: MimiSortableItemTemplate<T>,
    ctx: unknown,
  ): ctx is MimiSortableItemContext<T> {
    return true;
  }
}

/**
 * Pinta la plantilla de un elemento con su contexto, sin `NgTemplateOutlet` (lo lleva al JS
 * inicial del sitio; G3.1, spec 10). Recibe cada dato por separado: un objeto nuevo en cada
 * detección de cambios haría que el efecto se repitiera sin fin (NG0103).
 *
 * @internal No forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiSortableOutlet]' })
export class MimiSortableOutlet<T = unknown> {
  readonly template = input.required<TemplateRef<MimiSortableItemContext<T>>>({
    alias: 'mimiSortableOutlet',
  });
  readonly item = input.required<T>({ alias: 'mimiSortableOutletItem' });
  readonly index = input.required<number>({ alias: 'mimiSortableOutletIndex' });
  readonly grabbed = input.required<boolean>({ alias: 'mimiSortableOutletGrabbed' });

  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<MimiSortableItemContext<T>> | null = null;
  private rendered: TemplateRef<MimiSortableItemContext<T>> | null = null;

  private readonly render = effect(() => {
    const template = this.template();
    const context: MimiSortableItemContext<T> = {
      $implicit: this.item(),
      index: this.index(),
      grabbed: this.grabbed(),
    };
    untracked(() => {
      if (this.view && this.rendered === template) {
        Object.assign(this.view.context, context);
        this.view.markForCheck();
        return;
      }
      this.viewContainer.clear();
      this.rendered = template;
      this.view = this.viewContainer.createEmbeddedView(template, { ...context });
    });
  });
}

/** Lucide grip-vertical. */
const GRIP = [
  'M9 12h.01',
  'M9 5h.01',
  'M9 19h.01',
  'M15 12h.01',
  'M15 5h.01',
  'M15 19h.01',
] as const;

let nextId = 0;

/**
 * Lista ordenable: `<mimi-sortable-list aria-label="Prioridades" [(items)]="tareas"
 * [itemLabel]="titulo">` con `<ng-template mimiSortableItem let-tarea>…</ng-template>`.
 *
 * `items` cambia (un arreglo nuevo) al soltar un elemento en otro lugar, y `reordered` dice cuál
 * y de dónde a dónde. Se reordena desde el asa: con el puntero, el dedo o el teclado.
 */
@Component({
  selector: 'mimi-sortable-list',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkDragPreview,
    MimiSortableOutlet,
  ],
  template: `
    <ul
      cdkDropList
      cdkDropListLockAxis="y"
      [cdkDropListDisabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [class]="listClasses"
      (cdkDropListDropped)="onDrop($event)"
    >
      @for (item of items(); track trackItem(item, $index); let index = $index) {
        <li
          cdkDrag
          cdkDragPreviewContainer="parent"
          [cdkDragData]="item"
          [attr.aria-roledescription]="text.roleDescription"
          [attr.data-grabbed]="grabbedIndex() === index || null"
          [attr.data-index]="index"
          [class]="itemClasses"
          (cdkDragStarted)="onDragStart($event)"
        >
          <button
            #handle
            cdkDragHandle
            type="button"
            data-slot="handle"
            [disabled]="disabled()"
            [attr.aria-label]="text.handle(labelOf(item))"
            [attr.aria-describedby]="instructionsId"
            [attr.aria-pressed]="grabbedIndex() === index"
            [class]="handleClasses"
            (keydown)="onHandleKeydown($event, index)"
            (blur)="onHandleBlur(index)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
              aria-hidden="true"
            >
              @for (d of grip; track d) {
                <path [attr.d]="d" />
              }
            </svg>
          </button>
          @if (itemTemplate(); as custom) {
            <ng-container
              [mimiSortableOutlet]="custom.template"
              [mimiSortableOutletItem]="item"
              [mimiSortableOutletIndex]="index"
              [mimiSortableOutletGrabbed]="grabbedIndex() === index"
            />
          } @else {
            <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ labelOf(item) }}</span>
          }
          <ng-template cdkDragPlaceholder>
            <li
              aria-hidden="true"
              data-slot="placeholder"
              [class]="placeholderClasses"
              [style.height.px]="placeholderHeight()"
            ></li>
          </ng-template>
          <!-- El cdk mueve la copia con su transform; el giro va en el hijo. -->
          <ng-template cdkDragPreview [matchSize]="true">
            <div data-slot="preview" class="list-none">
              <div [class]="previewClasses">
                <span [class]="handleClasses" data-dragging="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="size-4"
                    aria-hidden="true"
                  >
                    @for (d of grip; track d) {
                      <path [attr.d]="d" />
                    }
                  </svg>
                </span>
                @if (itemTemplate(); as custom) {
                  <ng-container
                    [mimiSortableOutlet]="custom.template"
                    [mimiSortableOutletItem]="item"
                    [mimiSortableOutletIndex]="index"
                    [mimiSortableOutletGrabbed]="true"
                  />
                } @else {
                  <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{
                    labelOf(item)
                  }}</span>
                }
              </div>
            </div>
          </ng-template>
        </li>
      }
    </ul>
    <span [id]="instructionsId" class="sr-only">{{ text.instructions }}</span>
    <span
      role="status"
      aria-live="assertive"
      data-slot="announcement"
      class="min-h-[18px] text-[12.5px] text-muted-foreground"
      >{{ announcement() }}</span
    >
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-disabled]': 'disabled() || null',
    '[attr.data-sorting]': 'grabbedIndex() !== null || null',
    // aria-* van a la lista.
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSortableList<T = unknown> {
  /** Los elementos, en orden. Se reemplaza por un arreglo nuevo al reordenar. */
  readonly items = model<T[]>([]);
  /** Nombre de un elemento para el asa y los anuncios. Por defecto, `String(item)`. */
  readonly itemLabel = input<(item: T) => string>((item) => String(item));
  /**
   * Clave estable de cada elemento (`track`). Por defecto, el propio elemento; si hay elementos
   * repetidos (primitivos iguales), el índice, y en desarrollo avisa de que falta `trackBy` (G3.P).
   */
  readonly trackBy = input<((item: T) => unknown) | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly userClass = input('', { alias: 'class' });

  /** Un elemento se soltó en otro lugar. */
  readonly reordered = output<MimiSortableReorder<T>>();

  protected readonly text = inject(MIMI_SORTABLE_TEXT);
  private readonly injector = inject(Injector);
  protected readonly itemTemplate = contentChild(MimiSortableItemTemplate);
  private readonly handles = viewChildren<ElementRef<HTMLButtonElement>>('handle');

  protected readonly grip = GRIP;
  protected readonly instructionsId = `mimi-sortable-${nextId++}-help`;
  /** Índice del elemento agarrado con el teclado. */
  protected readonly grabbedIndex = signal<number | null>(null);
  /** Dónde estaba al agarrarlo (para Escape) y el orden de entonces. */
  private grabStart: { index: number; items: T[] } | null = null;
  protected readonly announcement = signal('');
  /** Alto del elemento que se arrastra con el puntero: el del hueco. */
  protected readonly placeholderHeight = signal<number | null>(null);

  protected readonly classes = computed(() => cn('flex flex-col gap-2', this.userClass()));

  protected readonly listClasses = cn(
    'relative m-0 flex list-none flex-col gap-[var(--mimi-sortable-gap-s,var(--mimi-sortable-gap,8px))] p-0',
    // Mientras se arrastra, los demás se apartan con la curva del diseño (0,18 s).
    '[&.cdk-drop-list-dragging>li:not(.cdk-drag-placeholder)]:transition-transform',
    '[&.cdk-drop-list-dragging>li:not(.cdk-drag-placeholder)]:duration-[180ms]',
    '[&.cdk-drop-list-dragging>li:not(.cdk-drag-placeholder)]:ease-[var(--mimi-sortable-easing,cubic-bezier(.2,.8,.2,1))]',
  );

  private readonly itemShape =
    'flex min-h-[var(--mimi-sortable-item-h,var(--mimi-sortable-item-height,56px))] items-center gap-2.5 rounded-[var(--mimi-sortable-radius,var(--mimi-radius))] border border-border bg-[color:var(--mimi-sortable-bg,var(--mimi-card))] ps-1.5 pe-3 text-card-foreground select-none';

  /** El elemento, y agarrado con el teclado: levantado (sombra y anillo del hueco). */
  protected readonly itemClasses = cn(
    this.itemShape,
    'transition-shadow duration-150',
    '[&.cdk-drag-animating]:transition-transform [&.cdk-drag-animating]:duration-[180ms] [&.cdk-drag-animating]:ease-[var(--mimi-sortable-easing,cubic-bezier(.2,.8,.2,1))]',
    // El color de arrastrar y soltar es el de la marca (anillo del tema), no el azul de `info`
    // (informe del usuario, 12/11/2026).
    'data-[grabbed]:relative data-[grabbed]:z-10 data-[grabbed]:shadow-[shadow:var(--mimi-shadow-popover),0_0_0_2px_var(--mimi-sortable-drop,var(--mimi-ring))]',
  );

  /** La copia que sigue al puntero: girada y algo más grande, como el diseño. */
  protected readonly previewClasses = cn(
    this.itemShape,
    'size-full [transform:var(--mimi-sortable-lift,rotate(-1.5deg)_scale(1.03))] shadow-[shadow:var(--mimi-shadow-popover),0_0_0_2px_var(--mimi-sortable-drop,var(--mimi-ring))]',
  );

  protected readonly placeholderClasses =
    'box-border min-h-[var(--mimi-sortable-item-h,var(--mimi-sortable-item-height,56px))] list-none rounded-[var(--mimi-sortable-radius,var(--mimi-radius))] border-2 border-dashed border-[color:var(--mimi-sortable-drop,var(--mimi-ring))] bg-[color:var(--mimi-sortable-drop-bg,var(--mimi-primary-subtle))]';

  protected readonly handleClasses = cn(
    'inline-flex h-9 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground',
    'mimi-transition hover:bg-[color:var(--mimi-sortable-handle-hover,var(--mimi-accent))] hover:text-foreground',
    'aria-pressed:bg-[color:var(--mimi-sortable-handle-hover,var(--mimi-accent))] aria-pressed:text-foreground data-[dragging]:bg-[color:var(--mimi-sortable-handle-hover,var(--mimi-accent))] data-[dragging]:text-foreground',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
  );

  protected labelOf(item: T): string {
    return this.itemLabel()(item);
  }

  /** Sin `trackBy`, el elemento mismo solo vale si no se repite (si no, NG0955 y vistas mezcladas). */
  private readonly repeated = computed(() => {
    if (this.trackBy()) return false;
    const items = this.items();
    return new Set(items).size !== items.length;
  });

  private warnedRepeated = false;
  private readonly warnRepeated = isDevMode()
    ? effect(() => {
        if (!this.repeated() || this.warnedRepeated) return;
        this.warnedRepeated = true;
        console.warn(
          '[Mimi] Sortable List: hay elementos repetidos y falta `trackBy`; se identifican por su ' +
            'lugar. Usa `[trackBy]="x => x.id"` para que las vistas sigan a cada elemento.',
        );
      })
    : null;

  protected trackItem(item: T, index: number): unknown {
    const trackBy = this.trackBy();
    if (trackBy) return trackBy(item);
    return this.repeated() ? index : item;
  }

  // ── Puntero y dedo (cdk) ─────────────────────────────────────────────────────────────

  protected onDragStart(event: CdkDragStart<T>): void {
    this.cancelKeyboardGrab(false);
    this.placeholderHeight.set(event.source.element.nativeElement.offsetHeight || null);
  }

  protected onDrop(event: CdkDragDrop<T[], T[], T>): void {
    this.placeholderHeight.set(null);
    const { previousIndex, currentIndex } = event;
    if (previousIndex === currentIndex) return;
    const items = this.items();
    this.items.set(move(items, previousIndex, currentIndex));
    this.reordered.emit({ item: items[previousIndex], previousIndex, currentIndex });
    this.announce('dropped', currentIndex);
  }

  // ── Teclado (G3.2-d) ─────────────────────────────────────────────────────────────────

  protected onHandleKeydown(event: KeyboardEvent, index: number): void {
    if (this.disabled()) return;
    const grabbed = this.grabbedIndex();
    if (grabbed === null) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.grabStart = { index, items: this.items() };
        this.grabbedIndex.set(index);
        this.announce('grabbed', index);
      }
      return;
    }
    const last = this.items().length - 1;
    let target: number | null = null;
    switch (event.key) {
      case 'ArrowUp':
        target = Math.max(0, grabbed - 1);
        break;
      case 'ArrowDown':
        target = Math.min(last, grabbed + 1);
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = last;
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.drop();
        return;
      case 'Escape':
        // Cancela el agarre y nada más: no cierra el diálogo que contenga la lista (G3.P).
        event.preventDefault();
        event.stopPropagation();
        this.cancelKeyboardGrab(true);
        return;
      default:
        return;
    }
    event.preventDefault();
    if (target === grabbed) return;
    this.items.set(move(this.items(), grabbed, target));
    this.grabbedIndex.set(target);
    this.announce('moved', target);
    this.focusHandle(target);
  }

  /** Si el foco sale del asa con el elemento agarrado, se suelta donde está. */
  protected onHandleBlur(index: number): void {
    // Al mover, el asa se vuelve a enfocar en su nuevo lugar: solo cuenta un blur de verdad.
    afterNextRender(
      () => {
        const grabbed = this.grabbedIndex();
        if (grabbed === null || grabbed !== index) return;
        const handle = this.handles()[grabbed]?.nativeElement;
        if (handle && handle.ownerDocument.activeElement !== handle) this.drop();
      },
      { injector: this.injector },
    );
  }

  private drop(): void {
    const grabbed = this.grabbedIndex();
    const start = this.grabStart;
    this.grabbedIndex.set(null);
    this.grabStart = null;
    if (grabbed === null || !start) return;
    this.announce('dropped', grabbed);
    if (grabbed !== start.index) {
      this.reordered.emit({
        item: start.items[start.index],
        previousIndex: start.index,
        currentIndex: grabbed,
      });
    }
  }

  /** Escape (o un arrastre con el puntero): vuelve al orden de cuando se agarró. */
  private cancelKeyboardGrab(announce: boolean): void {
    const start = this.grabStart;
    if (!start) return;
    this.grabbedIndex.set(null);
    this.grabStart = null;
    this.items.set(start.items);
    if (announce) {
      this.announce('canceled', start.index);
      this.focusHandle(start.index);
    }
  }

  private announce(kind: 'grabbed' | 'moved' | 'dropped' | 'canceled', index: number): void {
    const items = this.items();
    const label = this.labelOf(items[index]);
    this.announcement.set(this.text[kind](label, index + 1, items.length));
  }

  private focusHandle(index: number): void {
    afterNextRender(() => this.handles()[index]?.nativeElement.focus(), {
      injector: this.injector,
    });
  }
}

/** Un arreglo nuevo con el elemento de `from` en `to`. */
function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Todo lo que hace falta para usar la lista: `imports: [MimiSortableListImports]`. */
export const MimiSortableListImports = [MimiSortableList, MimiSortableItemTemplate] as const;
