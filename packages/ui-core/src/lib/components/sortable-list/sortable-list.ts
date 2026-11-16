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
  DestroyRef,
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
import {
  MIMI_SORTABLE_GROUP,
  MimiSortableGroup,
  type MimiSortableGrab,
  type MimiSortableGroupMember,
  type MimiSortableMove,
} from './sortable-group';

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

/** La lista (sin la dirección, que pone `orientation`). */
const LIST_BASE = cn(
  'relative m-0 flex list-none gap-[var(--mimi-sortable-gap-s,var(--mimi-sortable-gap,8px))] p-0',
  // Mientras se arrastra, los demás se apartan con la curva del diseño (0,18 s). La clase del cdk
  // está en el anfitrión (la zona de soltar), no en el ul.
  '[.cdk-drop-list-dragging>&>li:not(.cdk-drag-placeholder)]:transition-transform',
  '[.cdk-drop-list-dragging>&>li:not(.cdk-drag-placeholder)]:duration-[180ms]',
  '[.cdk-drop-list-dragging>&>li:not(.cdk-drag-placeholder)]:ease-[var(--mimi-sortable-easing,cubic-bezier(.2,.8,.2,1))]',
);

/**
 * Lo que va dentro de la zona de soltar, antes de la lista (`<h3 mimiSortableHeader>`), y después
 * (`<button mimiSortableFooter>`): en un tablero, el título y «Agregar» de la columna, así toda la
 * columna acepta la tarjeta (16/11/2026). Solo marcan el sitio; no cambian el elemento.
 */
@Directive({ selector: '[mimiSortableHeader]' })
export class MimiSortableHeader {}

/** Ver `MimiSortableHeader`. */
@Directive({ selector: '[mimiSortableFooter]' })
export class MimiSortableFooter {}

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
  // La zona de soltar es el componente entero (cabecera, lista, pie y el hueco que quede), no solo
  // el ul, que mide lo que sus elementos: los elementos van en el ul (`elementContainerSelector`).
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }, CdkDropList],
  imports: [CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragPreview, MimiSortableOutlet],
  template: `
    <ng-content select="[mimiSortableHeader]" />
    <ul
      data-slot="items"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-orientation]="orientation() === 'horizontal' ? 'horizontal' : null"
      [attr.data-empty]="items().length ? null : ''"
      [class]="listClasses()"
    >
      @for (item of items(); track trackItem(item, $index); let index = $index) {
        <li
          cdkDrag
          [cdkDragPreviewContainer]="group ? 'global' : 'parent'"
          [cdkDragData]="item"
          [attr.aria-roledescription]="text.roleDescription"
          [attr.data-grabbed]="grabbedIndex() === index || null"
          [attr.data-index]="index"
          [class]="itemClasses"
          (cdkDragStarted)="onDragStart($event)"
          (cdkDragEnded)="onDragEnded()"
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
            (click)="onHandleClick(index)"
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
      } @empty {
        @if (group) {
          <!-- Una lista vacía de un grupo: se ve dónde soltar (R.21). -->
          <!-- Con un elemento agarrado, tocarla lo pone aquí (sin arrastrar, WCAG 2.5.7). -->
          <!-- El toque lo recoge el anfitrión (onZoneClick), como el del resto del hueco. -->
          <li aria-hidden="true" data-slot="empty" [class]="emptyClasses">
            {{ text.empty }}
          </li>
        }
      }
    </ul>
    <!-- Solo para aria-describedby: fuera del orden de lectura (no se lee una vez por lista). -->
    <span [id]="instructionsId" hidden>{{
      group ? text.instructionsGroup : text.instructions
    }}</span>
    <!-- Solo para lectores de pantalla, como las demás regiones vivas de Mimi (no se ve ni ocupa sitio). -->
    <span role="status" data-slot="announcement" class="sr-only">{{ announcement() }}</span>
    <ng-content select="[mimiSortableFooter]" />
  `,
  host: {
    '[class]': 'classes()',
    '(click)': 'onZoneClick($event)',
    '(mousedown)': 'onZoneMousedown($event)',
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
  /** Identificador de la lista en un grupo (R.21): sale en `moved` (`from.list`, `to.list`). */
  readonly listId = input<string>();
  /** `vertical` (por defecto) u `horizontal` (los elementos en fila; ← → mueven sin grupo). */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /**
   * Si la lista acepta un elemento que viene de otra (R.21): por ejemplo, «no más de 3 en curso».
   * Vale para el puntero, el dedo y el teclado.
   */
  readonly accepts = input<((item: T, list: MimiSortableList<T>) => boolean) | undefined>(
    undefined,
  );

  /** Un elemento se soltó en otro lugar de la misma lista. */
  readonly reordered = output<MimiSortableReorder<T>>();
  /** Un elemento llegó a esta lista desde otra del grupo (R.21). */
  readonly moved = output<MimiSortableMove<T>>();

  protected readonly text = inject(MIMI_SORTABLE_TEXT);
  private readonly injector = inject(Injector);
  /** El grupo, si la lista está dentro de un `mimi-sortable-group` (R.21). */
  protected readonly group = inject(MIMI_SORTABLE_GROUP, { optional: true });
  protected readonly self = this;
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** Los de otra lista entran si `accepts` lo permite (el cdk lo pregunta al pasar por encima). */
  protected readonly enterPredicate = (drag: CdkDrag<T>): boolean => this.canAccept(drag.data);

  /**
   * El `cdkDropList` del anfitrión (la zona de soltar entera). Sus entradas se ponen aquí: el
   * anfitrión no tiene plantilla propia donde enlazarlas.
   */
  private readonly dropList = (() => {
    const dropList = inject<CdkDropList<MimiSortableList<T>>>(CdkDropList);
    dropList.data = this;
    dropList.enterPredicate = this.enterPredicate;
    // Los elementos están en el ul (el cdk lo busca al iniciarse, con la vista ya creada).
    dropList.elementContainerSelector = ':scope > ul';
    const dropped = dropList.dropped.subscribe((event) => this.onDrop(event));
    inject(DestroyRef).onDestroy(() => dropped.unsubscribe());
    return dropList;
  })();
  private readonly syncDropList = effect(() => {
    const orientation = this.orientation();
    this.dropList.orientation = orientation;
    this.dropList.lockAxis = this.group ? null : orientation === 'horizontal' ? 'x' : 'y';
    this.dropList.disabled = this.disabled();
  });

  private readonly membership = (() => {
    this.group?.register(this as MimiSortableGroupMember);
    inject(DestroyRef).onDestroy(() => this.group?.unregister(this as MimiSortableGroupMember));
  })();
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

  // `relative`: las instrucciones `sr-only` (absolutas) quedan dentro de la lista; si no, en una
  // columna con desplazamiento horizontal se escapan y desbordan la página (kanban-01 a 360 px).
  protected readonly classes = computed(() => cn('relative flex flex-col gap-2', this.userClass()));

  protected readonly listClasses = computed(() =>
    cn(
      this.orientation() === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
      // En un grupo, una lista vacía conserva un alto donde soltar, y la lista crece hasta el pie:
      // si la columna es más alta que sus tarjetas, el hueco del cdk (al final) se ve donde caerá.
      this.group &&
        'min-h-[var(--mimi-sortable-item-h,var(--mimi-sortable-item-height,56px))] flex-1',
      LIST_BASE,
    ),
  );

  protected readonly emptyClasses =
    'flex min-h-[var(--mimi-sortable-item-h,var(--mimi-sortable-item-height,56px))] items-center justify-center rounded-[var(--mimi-sortable-radius,var(--mimi-radius))] border-2 border-dashed border-border text-[12.5px] text-muted-foreground';

  /** @internal Para el grupo: lo que hay ahora, y volver a eso (Escape). */
  snapshot(): T[] {
    return this.items();
  }

  /** @internal */
  restore(items: T[]): void {
    this.items.set(items);
  }

  private canAccept(item: T): boolean {
    const accepts = this.accepts();
    return !accepts || accepts(item, this);
  }

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
    'disabled:cursor-not-allowed disabled:opacity-[var(--mimi-disabled-opacity,0.5)]',
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

  protected onDrop(event: CdkDragDrop<MimiSortableList<T>, MimiSortableList<T>, T>): void {
    this.placeholderHeight.set(null);
    const { previousIndex, currentIndex } = event;
    const from = event.previousContainer?.data;
    if (from && from !== this) {
      this.receive(from, previousIndex, currentIndex);
      this.announce('droppedInList', currentIndex);
      return;
    }
    if (previousIndex === currentIndex) return;
    const items = this.items();
    this.items.set(move(items, previousIndex, currentIndex));
    this.reordered.emit({ item: items[previousIndex], previousIndex, currentIndex });
    this.announce('dropped', currentIndex);
  }

  /** Tras un arrastre, el `click` que sigue al soltar sobre el asa no cuenta como un toque. */
  private justDragged = false;

  protected onDragEnded(): void {
    this.justDragged = true;
    setTimeout(() => (this.justDragged = false));
  }

  // ── Con toques, sin arrastrar (WCAG 2.5.7; revisión de accesibilidad de la tanda 3) ──────
  //
  // Tocar un asa agarra el elemento (como Espacio); con uno agarrado, tocar otra asa (de esta lista
  // o de otra del grupo) lo pone en ese lugar, y tocar la zona de una lista vacía, allí. Tocar la
  // misma asa lo suelta donde está.

  protected onHandleClick(index: number): void {
    if (this.disabled() || this.justDragged) return;
    const holder = (this.group?.holder() ??
      (this.grabbedIndex() !== null ? this : null)) as MimiSortableList<T> | null;
    if (!holder) {
      this.startGrab(index);
      return;
    }
    this.placeHere(holder, index);
  }

  /**
   * El hueco de la zona (no una tarjeta ni un control de la cabecera o el pie): el propio
   * anfitrión, el ul o la marca de lista vacía.
   */
  private isGap(event: Event): boolean {
    const target = event.target as Element | null;
    if (!target) return false;
    return (
      target === this.host ||
      target === this.host.querySelector(':scope > ul') ||
      !!target.closest('[data-slot="empty"]')
    );
  }

  /** Con un elemento agarrado, el clic en el hueco no quita el foco del asa (su blur lo soltaría). */
  protected onZoneMousedown(event: MouseEvent): void {
    if (this.group?.holder() && this.isGap(event)) event.preventDefault();
  }

  /** Tocar el hueco de una lista con un elemento agarrado lo pone al final (sin arrastrar). */
  protected onZoneClick(event: MouseEvent): void {
    const holder = this.group?.holder() as MimiSortableList<T> | null | undefined;
    if (!holder || this.disabled() || !this.isGap(event)) return;
    this.placeHere(holder, holder === this ? this.items().length - 1 : this.items().length);
  }

  /** Lleva el elemento que tiene agarrado `holder` a `index` de esta lista y lo suelta. */
  private placeHere(holder: MimiSortableList<T>, index: number): void {
    const from = holder.grabbedIndex();
    if (from === null) return;
    if (holder === this) {
      if (index !== from) {
        this.items.set(move(this.items(), from, index));
        this.grabbedIndex.set(index);
      }
      this.drop();
      this.focusHandle(index);
      return;
    }
    const item = holder.items()[from];
    if (!this.canAccept(item)) {
      // Con el puntero el foco ya pasó a esta asa: el agarre termina (nada se movió) y queda el
      // aviso; si no, el blur del origen lo soltaría y taparía el aviso con «soltado».
      holder.cancelKeyboardGrab(false);
      holder.announceRejected(this, item);
      return;
    }
    holder.items.set(holder.items().filter((_, i) => i !== from));
    const next = [...this.items()];
    next.splice(index, 0, item);
    this.items.set(next);
    holder.grabbedIndex.set(null);
    holder.grabStart = null;
    this.grabbedIndex.set(index);
    this.drop();
    this.focusHandle(index);
  }

  private startGrab(index: number): void {
    this.grabStart = { index, items: this.items() };
    this.group?.start(this, index, this.items()[index]);
    this.grabbedIndex.set(index);
    this.group?.clearOthers(this);
    this.announce('grabbed', index);
  }

  /** @internal Para el grupo. */
  grabbedAt(): number | null {
    return this.grabbedIndex();
  }

  /** @internal Para el grupo. */
  clearAnnouncement(): void {
    this.announcement.set('');
  }

  private announceRejected(target: MimiSortableList<T>, item: T): void {
    const list = target.ariaLabel() || target.listId() || '';
    this.setAnnouncement(this.text.rejected(this.labelOf(item), list));
  }

  // ── Teclado (G3.2-d) ─────────────────────────────────────────────────────────────────

  protected onHandleKeydown(event: KeyboardEvent, index: number): void {
    if (this.disabled()) return;
    const grabbed = this.grabbedIndex();
    if (grabbed === null) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.startGrab(index);
      }
      return;
    }
    const last = this.items().length - 1;
    // Dentro de la lista, las flechas de su eje; a otra lista del grupo, las del otro eje.
    const horizontal = this.orientation() === 'horizontal';
    const rtl = this.host.closest('[dir]')?.getAttribute('dir') === 'rtl';
    const back = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const forward = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    let target: number | null = null;
    switch (event.key) {
      case back:
        target = Math.max(0, grabbed - 1);
        break;
      case forward:
        target = Math.min(last, grabbed + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown': {
        // El otro eje: en una lista vertical, ← →; en una horizontal, ↑ ↓ (↑ la anterior).
        const upDown = event.key === 'ArrowUp' || event.key === 'ArrowDown';
        if (!this.group || upDown !== horizontal) return;
        event.preventDefault();
        const toward = upDown ? (event.key === 'ArrowUp' ? 'ArrowLeft' : 'ArrowRight') : event.key;
        this.toNeighbor(toward as 'ArrowLeft' | 'ArrowRight', grabbed);
        return;
      }
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

  /**
   * ← → con un elemento agarrado (R.21): pasa a la lista de al lado del grupo, al mismo lugar o al
   * último, si esa lista lo acepta. El agarre sigue (en la otra lista) y se anuncia.
   */
  private toNeighbor(key: 'ArrowLeft' | 'ArrowRight', grabbed: number): void {
    const neighbor = this.group?.neighbor(this, key) as MimiSortableList<T> | null | undefined;
    const item = this.items()[grabbed];
    if (!neighbor || neighbor.disabled()) return;
    if (!neighbor.canAccept(item)) {
      // Sin moverlo, pero se dice por qué (no un silencio).
      this.announceRejected(neighbor, item);
      return;
    }
    const index = Math.min(grabbed, neighbor.items().length);
    this.items.set(this.items().filter((_, i) => i !== grabbed));
    const next = [...neighbor.items()];
    next.splice(index, 0, item);
    neighbor.items.set(next);
    this.grabbedIndex.set(null);
    this.grabStart = null;
    neighbor.grabbedIndex.set(index);
    neighbor.announce('movedToList', index);
    neighbor.focusHandle(index);
  }

  /** Un elemento llega de otra lista (puntero o dedo): los dos modelos, en el mismo momento. */
  private receive(from: MimiSortableList<T>, previousIndex: number, currentIndex: number): void {
    const source = from.items();
    const item = source[previousIndex];
    const next = [...this.items()];
    next.splice(currentIndex, 0, item);
    from.items.set(source.filter((_, i) => i !== previousIndex));
    this.items.set(next);
    this.emitMove({
      item,
      from: { list: from.listId(), index: previousIndex },
      to: { list: this.listId(), index: currentIndex },
    });
  }

  private emitMove(move: MimiSortableMove<T>): void {
    this.moved.emit(move);
    this.group?.moved.emit(move as MimiSortableMove<unknown>);
  }

  private drop(): void {
    const grabbed = this.grabbedIndex();
    const shared = this.group?.grab as MimiSortableGrab<T> | null | undefined;
    const start = this.grabStart;
    this.grabbedIndex.set(null);
    this.grabStart = null;
    if (this.group) {
      this.group.grab = null;
      this.group.clearOthers(this);
    }
    if (grabbed === null) return;
    if (shared) {
      // Llegó desde otra lista del grupo con el teclado.
      if (shared.origin !== this) {
        const origin = shared.origin as MimiSortableList<T>;
        this.announce('droppedInList', grabbed);
        this.emitMove({
          item: shared.item,
          from: { list: origin.listId(), index: shared.originIndex },
          to: { list: this.listId(), index: grabbed },
        });
        return;
      }
      // Volvió a su lista (quizá tras pasar por otras): cuenta como un reorden si cambió de lugar.
      this.announce('dropped', grabbed);
      if (grabbed !== shared.originIndex) {
        this.reordered.emit({
          item: shared.item,
          previousIndex: shared.originIndex,
          currentIndex: grabbed,
        });
      }
      return;
    }
    if (!start) return;
    this.announce('dropped', grabbed);
    if (grabbed !== start.index) {
      this.reordered.emit({
        item: start.items[start.index],
        previousIndex: start.index,
        currentIndex: grabbed,
      });
    }
  }

  /** Escape (o un arrastre con el puntero): vuelve al orden de cuando se agarró, en todas las listas. */
  private cancelKeyboardGrab(announce: boolean): void {
    const shared = this.group?.grab as MimiSortableGrab<T> | null | undefined;
    if (shared) {
      this.group!.grab = null;
      this.group!.clearOthers(shared.origin as MimiSortableList<T>);
      this.grabbedIndex.set(null);
      this.grabStart = null;
      for (const [member, items] of shared.snapshot) member.restore(items);
      const origin = shared.origin as MimiSortableList<T>;
      origin.grabbedIndex.set(null);
      origin.grabStart = null;
      if (announce) {
        origin.announce('canceled', shared.originIndex);
        origin.focusHandle(shared.originIndex);
      }
      return;
    }
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

  private announce(
    kind: 'grabbed' | 'moved' | 'dropped' | 'canceled' | 'movedToList' | 'droppedInList',
    index: number,
  ): void {
    const items = this.items();
    const label = this.labelOf(items[index]);
    if (kind === 'movedToList' || kind === 'droppedInList') {
      const list = this.ariaLabel() || this.listId() || '';
      this.setAnnouncement(this.text[kind](label, list, index + 1, items.length));
      return;
    }
    this.setAnnouncement(this.text[kind](label, index + 1, items.length));
  }

  /**
   * Escribe el anuncio. Si es el mismo texto que ya hay, alterna un espacio duro al final: sin un
   * cambio en el DOM, los lectores de pantalla no lo vuelven a leer (ida y vuelta entre listas).
   */
  private setAnnouncement(text: string): void {
    const current = this.announcement();
    if (current.replace(/ $/, '') !== text) this.announcement.set(text);
    else this.announcement.set(current.endsWith(' ') ? text : `${text} `);
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

/**
 * Todo lo que hace falta para usar la lista: `imports: [MimiSortableListImports]` (con el grupo de
 * listas conectadas, R.21).
 */
export const MimiSortableListImports = [
  MimiSortableList,
  MimiSortableItemTemplate,
  MimiSortableHeader,
  MimiSortableFooter,
  MimiSortableGroup,
] as const;
