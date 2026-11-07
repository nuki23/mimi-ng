import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  afterNextRender,
  booleanAttribute,
  type EmbeddedViewRef,
  ViewContainerRef,
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
import type { FormValueControl } from '@angular/forms/signals';
import { MIMI_CHECKBOX_BOX_STYLES } from '@/components/ui/checkbox';
import { cn } from '@/components/ui/utils/cn';
import { MIMI_TREE_TEXT } from './tree-texts';

/*
 * Tree (docs/design/Mimi F4 Command Tree Sortable.dc.html, «2 · Tree»; prefijo de tokens `tree`,
 * spec 13, G3.0).
 *
 * Patrón «Tree View» de la APG con foco itinerante (una sola parada de Tab): filas planas con
 * `aria-level`, `aria-setsize` y `aria-posinset`. Base propia (plan, G3.1-a): el `ngTree` de
 * @angular/aria no tiene casillas con estado parcial ni carga diferida, que pide el diseño;
 * `Directionality` del cdk invierte ← → en RTL.
 *
 * Simple: un nodo con hijos se abre o cierra y una hoja se elige (`aria-selected`). Múltiple
 * (`multiple`): casillas con estado parcial en el `aria-checked` del nodo; la casilla se dibuja
 * con los estilos de Checkbox, sin un control enfocable dentro del nodo (G3.1-d).
 */

/** Un nodo del árbol. `id` es único en todo el árbol y es lo que lleva `value`. */
export interface MimiTreeNode<T = unknown> {
  id: string;
  label: string;
  /** Hijos ya conocidos. */
  children?: MimiTreeNode<T>[];
  /** Tiene hijos que se piden al abrirlo con `loadChildren` (carga diferida). */
  hasChildren?: boolean;
  /** Dato secundario a la derecha (tamaño, cantidad…), en letra monoespaciada. */
  meta?: string;
  /** Se puede enfocar y abrir, pero no elegir ni marcar. */
  disabled?: boolean;
  /** Lo que quieras llevar con el nodo (lo recibe la plantilla). */
  data?: T;
}

/** Contexto de `<ng-template mimiTreeNode let-node>`. */
export interface MimiTreeNodeContext<T = unknown> {
  $implicit: MimiTreeNode<T>;
  /** Nivel, desde 1. */
  level: number;
  expanded: boolean;
  /** Elegido (simple) o marcado (múltiple). */
  selected: boolean;
}

/**
 * Contenido propio de cada nodo (ícono, texto, datos); reemplaza a la etiqueta y `meta`:
 *
 * ```html
 * <ng-template mimiTreeNode let-node let-expanded="expanded">…</ng-template>
 * ```
 */
@Directive({ selector: 'ng-template[mimiTreeNode]' })
// `any` por defecto: el tipo de `nodes` no llega al `ng-template` (Angular no lo infiere), y con
// `unknown` la plantilla del usuario no podría leer `node.data.algo` con strictTemplates.
export class MimiTreeNodeTemplate<T = any> {
  readonly template = inject<TemplateRef<MimiTreeNodeContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: MimiTreeNodeTemplate<T>,
    ctx: unknown,
  ): ctx is MimiTreeNodeContext<T> {
    return true;
  }
}

/**
 * Pinta la plantilla del nodo con su contexto. Se usa en vez de `NgTemplateOutlet`: con él, el
 * optimizador de chunks llevaba `NgTemplateOutlet` al JS inicial del sitio (+1,6 kB, G3.1; spec
 * 10, «Trampas de tamaño»). Recibe cada dato por separado: un objeto de contexto nuevo en cada
 * detección de cambios haría que el efecto se repitiera sin fin (NG0103, encontrado en la G3.2).
 *
 * @internal No forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiTreeOutlet]' })
export class MimiTreeOutlet<T = unknown> {
  readonly template = input.required<TemplateRef<MimiTreeNodeContext<T>>>({
    alias: 'mimiTreeOutlet',
  });
  readonly node = input.required<MimiTreeNode<T>>({ alias: 'mimiTreeOutletNode' });
  readonly level = input.required<number>({ alias: 'mimiTreeOutletLevel' });
  readonly expanded = input.required<boolean>({ alias: 'mimiTreeOutletExpanded' });
  readonly selected = input.required<boolean>({ alias: 'mimiTreeOutletSelected' });

  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<MimiTreeNodeContext<T>> | null = null;
  private rendered: TemplateRef<MimiTreeNodeContext<T>> | null = null;

  private readonly render = effect(() => {
    const template = this.template();
    const context: MimiTreeNodeContext<T> = {
      $implicit: this.node(),
      level: this.level(),
      expanded: this.expanded(),
      selected: this.selected(),
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

type CheckState = 'checked' | 'unchecked' | 'indeterminate';
type LoadStatus = 'loading' | 'error';

/** Una fila visible: un nodo o el estado de la carga de los hijos de un nodo. */
interface Row<T> {
  kind: 'node' | LoadStatus;
  node: MimiTreeNode<T>;
  level: number;
  parent: MimiTreeNode<T> | null;
  setsize: number;
  posinset: number;
  expandable: boolean;
  expanded: boolean;
}

/** Quita acentos y pasa a minúsculas, para la búsqueda por la primera letra. */
const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Árbol: `<mimi-tree [nodes]="nodos" [(value)]="elegido" aria-label="Archivos" />`.
 *
 * - `value`: el id elegido (`string | null`) o, con `multiple`, los ids marcados (`string[]`).
 * - `expanded`: los ids abiertos (`[(expanded)]`).
 * - `loadChildren`: pide los hijos de un nodo con `hasChildren` la primera vez que se abre.
 *
 * Implementa `FormValueControl`: funciona con `[formField]`, `formControlName` y `[(ngModel)]`.
 */
@Component({
  selector: 'mimi-tree',
  imports: [MimiTreeOutlet],
  template: `
    <div
      role="tree"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-disabled]="disabled() || null"
      [attr.aria-busy]="busy() || null"
      class="flex flex-col gap-px outline-none"
      (keydown)="onKeydown($event)"
      (focusout)="onFocusout($event)"
    >
      @for (row of rows(); track row.kind + ':' + row.node.id) {
        @if (row.kind === 'node') {
          <div
            #item
            role="treeitem"
            [attr.data-id]="row.node.id"
            [attr.aria-level]="row.level"
            [attr.aria-setsize]="row.setsize"
            [attr.aria-posinset]="row.posinset"
            [attr.aria-expanded]="row.expandable ? row.expanded : null"
            [attr.aria-selected]="ariaSelected(row)"
            [attr.aria-checked]="multiple() ? ariaChecked(row.node) : null"
            [attr.aria-disabled]="row.node.disabled || null"
            [attr.aria-busy]="status().get(row.node.id) === 'loading' || null"
            [attr.data-state]="rowState(row)"
            [attr.data-disabled]="row.node.disabled || null"
            [attr.data-selected]="!multiple() && value() === row.node.id ? '' : null"
            [tabindex]="row.node.id === tabStop() ? 0 : -1"
            [class]="rowClasses"
            [style.padding-inline-start]="indentOf(row.level)"
            (click)="onRowClick(row, $event)"
            (focus)="activeId.set(row.node.id)"
          >
            <span
              aria-hidden="true"
              data-slot="chevron"
              class="inline-flex size-4 shrink-0 items-center justify-center text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(.2,.8,.2,1)] in-data-[selected]:text-current rtl:-scale-x-100"
              [class.invisible]="!row.expandable"
              [class.rotate-90]="row.expanded && status().get(row.node.id) !== 'loading'"
              (click)="onChevronClick(row, $event)"
            >
              @if (status().get(row.node.id) === 'loading') {
                <!-- Lucide loader-circle -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-3.5 animate-spin motion-reduce:animate-none"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              } @else {
                <!-- Lucide chevron-right -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="size-3.5"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              }
            </span>
            @if (multiple()) {
              <span
                aria-hidden="true"
                data-slot="checkbox"
                [class]="boxClasses"
                [attr.data-state]="checkStates().get(row.node.id)"
              >
                @switch (checkStates().get(row.node.id)) {
                  @case ('checked') {
                    <!-- Lucide check -->
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="size-3"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  }
                  @case ('indeterminate') {
                    <!-- Lucide minus -->
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="size-3"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  }
                }
              </span>
            }
            @if (nodeTemplate(); as custom) {
              <ng-container
                [mimiTreeOutlet]="custom.template"
                [mimiTreeOutletNode]="row.node"
                [mimiTreeOutletLevel]="row.level"
                [mimiTreeOutletExpanded]="row.expanded"
                [mimiTreeOutletSelected]="isSelected(row.node)"
              />
            } @else {
              <span class="min-w-0 flex-1 truncate">{{ row.node.label }}</span>
              @if (row.node.meta) {
                <span
                  class="font-mono text-[11px] text-muted-foreground in-data-[selected]:text-current"
                  >{{ row.node.meta }}</span
                >
              }
            }
          </div>
        } @else {
          <div
            aria-hidden="true"
            [attr.data-slot]="row.kind === 'loading' ? 'loading' : 'error'"
            class="flex h-7 items-center gap-2 pe-2 text-[12.5px] text-muted-foreground"
            [class.text-destructive-soft-foreground]="row.kind === 'error'"
            [style.padding-inline-start]="statusIndent(row.level)"
          >
            @if (row.kind === 'loading') {
              <span class="h-[9px] w-[120px] animate-mimi-pulse rounded-[4px] bg-muted"></span>
              {{ text.loading }}
            } @else {
              {{ text.loadError }}
            }
          </div>
        }
      }
    </div>
    <span class="sr-only" role="status">{{ announcement() }}</span>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-multiple]': 'multiple() || null',
    '[attr.data-disabled]': 'disabled() || null',
    // aria-* van al elemento con role="tree".
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiTree<T = unknown> implements FormValueControl<string | null | string[]> {
  /** Los nodos de primer nivel. */
  readonly nodes = input<MimiTreeNode<T>[]>([]);
  /** El id elegido (simple) o los ids marcados (`multiple`). */
  readonly value = model<string | null | string[]>(null);
  /** Selección múltiple con casillas y estado parcial. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Los ids de los nodos abiertos. */
  readonly expanded = model<string[]>([]);
  /** Pide los hijos de un nodo con `hasChildren` (sin `children`) la primera vez que se abre. */
  readonly loadChildren = input<(node: MimiTreeNode<T>) => Promise<MimiTreeNode<T>[]>>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  readonly userClass = input('', { alias: 'class' });

  /** Se emite cuando el foco sale del árbol: marca el control como tocado. */
  readonly touch = output<void>();

  protected readonly text = inject(MIMI_TREE_TEXT);
  private readonly dir = inject(Directionality, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly nodeTemplate = contentChild(MimiTreeNodeTemplate);
  private readonly items = viewChildren<ElementRef<HTMLElement>>('item');

  /** Hijos cargados con `loadChildren`, por id del padre. */
  private readonly loaded = signal(new Map<string, MimiTreeNode<T>[]>());
  /** Nodos cargando o con error. */
  protected readonly status = signal(new Map<string, LoadStatus>());
  /** El nodo con el foco itinerante. */
  protected readonly activeId = signal<string | null>(null);
  protected readonly announcement = signal('');

  protected readonly busy = computed(() => [...this.status().values()].includes('loading'));

  protected readonly classes = computed(() =>
    cn(
      'flex flex-col rounded-card border border-border bg-[color:var(--mimi-tree-bg,var(--mimi-card))] p-[var(--mimi-tree-padding,6px)] text-[length:var(--mimi-tree-font-size,13.5px)] text-card-foreground shadow-neutral',
      this.userClass(),
    ),
  );

  protected readonly rowClasses = cn(
    'flex h-[var(--mimi-tree-row-height,32px)] cursor-pointer items-center gap-1.5 rounded-[var(--mimi-tree-row-radius,var(--mimi-radius-sm))] pe-2 text-foreground outline-none select-none',
    'transition-[background-color,box-shadow] duration-150',
    'hover:bg-[color:var(--mimi-tree-hover,var(--mimi-accent))]',
    'focus-visible:shadow-[inset_0_0_0_2px_var(--mimi-ring)]',
    'data-[selected]:bg-[color:var(--mimi-tree-selected,var(--mimi-primary))] data-[selected]:font-semibold data-[selected]:text-[color:var(--mimi-tree-selected-fg,var(--mimi-primary-foreground))]',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent',
    'in-data-[multiple]:gap-2',
  );

  protected readonly boxClasses = MIMI_CHECKBOX_BOX_STYLES;

  /** Los hijos de un nodo: los suyos o los cargados. `null`: todavía no se conocen. */
  private childrenOf(node: MimiTreeNode<T>): MimiTreeNode<T>[] | null {
    return node.children ?? this.loaded().get(node.id) ?? null;
  }

  private isExpandable(node: MimiTreeNode<T>): boolean {
    const children = this.childrenOf(node);
    return children ? children.length > 0 : !!node.hasChildren;
  }

  /** Padre de cada nodo conocido (cargados incluidos). */
  private readonly parents = computed(() => {
    const parents = new Map<string, MimiTreeNode<T> | null>();
    const walk = (nodes: MimiTreeNode<T>[], parent: MimiTreeNode<T> | null) => {
      for (const node of nodes) {
        if (isDevMode() && parents.has(node.id)) {
          console.warn(
            `[Mimi] Tree: el id "${node.id}" está repetido; cada nodo necesita uno único.`,
          );
        }
        parents.set(node.id, parent);
        const children = node.children ?? this.loaded().get(node.id);
        if (children) walk(children, node);
      }
    };
    walk(this.nodes(), null);
    return parents;
  });

  private readonly expandedSet = computed(() => new Set(this.expanded()));

  /** Las filas visibles, en orden. */
  protected readonly rows = computed(() => {
    const rows: Row<T>[] = [];
    const expanded = this.expandedSet();
    const status = this.status();
    const walk = (nodes: MimiTreeNode<T>[], level: number, parent: MimiTreeNode<T> | null) => {
      nodes.forEach((node, index) => {
        const expandable = this.isExpandable(node);
        const open = expandable && expanded.has(node.id);
        rows.push({
          kind: 'node',
          node,
          level,
          parent,
          setsize: nodes.length,
          posinset: index + 1,
          expandable,
          expanded: open,
        });
        if (!open) return;
        const children = this.childrenOf(node);
        const state = status.get(node.id);
        if (state) rows.push({ ...rows[rows.length - 1], kind: state, level: level + 1 });
        else if (children) walk(children, level + 1, node);
      });
    };
    walk(this.nodes(), 1, null);
    return rows;
  });

  private readonly nodeRows = computed(() => this.rows().filter((row) => row.kind === 'node'));

  /** Ids marcados (múltiple). No se llama `checked`: lo reserva `FormValueControl`. */
  private readonly checkedIds = computed(() => {
    const value = this.value();
    return new Set(Array.isArray(value) ? value : []);
  });

  /** Estado de la casilla de cada nodo conocido: los padres, según sus hijos (G3.1-d). */
  protected readonly checkStates = computed(() => {
    const states = new Map<string, CheckState>();
    const checked = this.checkedIds();
    const visit = (node: MimiTreeNode<T>): CheckState => {
      const children = this.childrenOf(node);
      let state: CheckState;
      if (!children || children.length === 0) {
        state = checked.has(node.id) ? 'checked' : 'unchecked';
      } else {
        const childStates = children.map(visit);
        state = childStates.every((s) => s === 'checked')
          ? 'checked'
          : childStates.every((s) => s === 'unchecked')
            ? 'unchecked'
            : 'indeterminate';
      }
      states.set(node.id, state);
      return state;
    };
    this.nodes().forEach(visit);
    return states;
  });

  /**
   * El nodo con `tabindex="0"`: el activo o, si quedó oculto (se cerró su padre), su antepasado
   * visible más cercano; si no hay activo, el elegido o el primero.
   */
  protected readonly tabStop = computed(() => {
    const rows = this.nodeRows();
    const visible = new Set(rows.map((row) => row.node.id));
    let id = this.activeId();
    const parents = this.parents();
    while (id && !visible.has(id)) id = parents.get(id)?.id ?? null;
    if (id) return id;
    const value = this.value();
    if (typeof value === 'string' && visible.has(value)) return value;
    return rows[0]?.node.id ?? null;
  });

  protected ariaSelected(row: Row<T>): 'true' | 'false' | null {
    if (this.multiple() || row.expandable) return null;
    return this.value() === row.node.id ? 'true' : 'false';
  }

  protected ariaChecked(node: MimiTreeNode<T>): 'true' | 'false' | 'mixed' {
    const state = this.checkStates().get(node.id);
    return state === 'checked' ? 'true' : state === 'indeterminate' ? 'mixed' : 'false';
  }

  protected isSelected(node: MimiTreeNode<T>): boolean {
    return this.multiple()
      ? this.checkStates().get(node.id) === 'checked'
      : this.value() === node.id;
  }

  protected rowState(row: Row<T>): string {
    return row.expandable ? (row.expanded ? 'open' : 'closed') : 'leaf';
  }

  protected indentOf(level: number): string {
    return `calc(6px + ${level - 1} * var(--mimi-tree-indent, 18px))`;
  }

  /** Fila de carga o error (en el nivel de los hijos): a la altura de su texto, como el diseño. */
  protected statusIndent(level: number): string {
    return `calc(8px + ${level - 1} * var(--mimi-tree-indent, 18px) + 22px)`;
  }

  // ── Acciones ─────────────────────────────────────────────────────────────────────────

  private setExpanded(node: MimiTreeNode<T>, open: boolean): void {
    const current = this.expandedSet();
    if (current.has(node.id) === open) {
      if (open && this.status().get(node.id) === 'error') void this.load(node);
      return;
    }
    this.expanded.set(
      open ? [...this.expanded(), node.id] : this.expanded().filter((id) => id !== node.id),
    );
    if (open) void this.load(node);
  }

  private toggleExpanded(node: MimiTreeNode<T>): void {
    this.setExpanded(node, !this.expandedSet().has(node.id));
  }

  /** Pide los hijos si hace falta (primera vez, o reintento tras un error). */
  private async load(node: MimiTreeNode<T>): Promise<void> {
    if (node.children || this.loaded().has(node.id) || !node.hasChildren) return;
    if (this.status().get(node.id) === 'loading') return;
    const loader = this.loadChildren();
    if (!loader) {
      if (isDevMode()) {
        console.warn(`[Mimi] Tree: el nodo "${node.id}" tiene hasChildren y no hay loadChildren.`);
      }
      return;
    }
    this.setStatus(node.id, 'loading');
    this.announcement.set(this.text.loading);
    try {
      const children = await loader(node);
      this.loaded.update((map) => new Map(map).set(node.id, children));
      this.setStatus(node.id, null);
      this.announcement.set('');
      // Un padre marcado marca también lo que acaba de llegar.
      if (this.multiple() && this.checkedIds().has(node.id)) this.check(node, true);
    } catch {
      this.setStatus(node.id, 'error');
      this.announcement.set(this.text.loadError);
    }
  }

  private setStatus(id: string, state: LoadStatus | null): void {
    this.status.update((map) => {
      const next = new Map(map);
      if (state) next.set(id, state);
      else next.delete(id);
      return next;
    });
  }

  /** Marca o desmarca un nodo y lo cargado debajo, y recalcula sus antepasados. */
  private check(node: MimiTreeNode<T>, on: boolean): void {
    const ids = new Set(this.checkedIds());
    const apply = (current: MimiTreeNode<T>) => {
      if (current !== node && current.disabled) return;
      if (on) ids.add(current.id);
      else ids.delete(current.id);
      this.childrenOf(current)?.forEach(apply);
    };
    apply(node);
    const parents = this.parents();
    for (let parent = parents.get(node.id); parent; parent = parents.get(parent.id)) {
      const children = this.childrenOf(parent) ?? [];
      if (children.length > 0 && children.every((child) => this.isChecked(child, ids))) {
        ids.add(parent.id);
      } else {
        ids.delete(parent.id);
      }
    }
    // En el orden del árbol, para que el valor sea estable.
    const order: string[] = [];
    const walk = (nodes: MimiTreeNode<T>[]) =>
      nodes.forEach((n) => {
        if (ids.has(n.id)) order.push(n.id);
        const children = this.childrenOf(n);
        if (children) walk(children);
      });
    walk(this.nodes());
    // Ids que ya no están en el árbol (de otra carga) se conservan al final.
    for (const id of ids) if (!order.includes(id)) order.push(id);
    this.value.set(order);
  }

  private isChecked(node: MimiTreeNode<T>, ids: Set<string>): boolean {
    const children = this.childrenOf(node);
    if (!children || children.length === 0) return ids.has(node.id);
    return children.every((child) => this.isChecked(child, ids));
  }

  /** Enter, Espacio o clic en la fila (G3.1-c y G3.1-d). */
  private activate(row: Row<T>, key: 'enter' | 'space' | 'click'): void {
    if (this.disabled() || row.node.disabled) return;
    if (this.multiple()) {
      if (key === 'enter' && row.expandable) this.toggleExpanded(row.node);
      else this.check(row.node, this.checkStates().get(row.node.id) !== 'checked');
      return;
    }
    if (row.expandable) this.toggleExpanded(row.node);
    else this.value.set(row.node.id);
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────────────

  protected onRowClick(row: Row<T>, event: MouseEvent): void {
    this.activeId.set(row.node.id);
    (event.currentTarget as HTMLElement).focus();
    this.activate(row, 'click');
  }

  /** El chevrón abre o cierra sin elegir ni marcar. */
  protected onChevronClick(row: Row<T>, event: MouseEvent): void {
    if (!row.expandable) return;
    event.stopPropagation();
    this.activeId.set(row.node.id);
    this.focusActive();
    if (!this.disabled()) this.toggleExpanded(row.node);
  }

  protected onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.host.nativeElement.contains(next)) this.touch.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const rows = this.nodeRows();
    const index = rows.findIndex((row) => row.node.id === this.tabStop());
    const row = rows[index];
    if (!row) return;
    const rtl = this.dir?.value === 'rtl';
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let target: Row<T> | undefined;

    switch (event.key) {
      case 'ArrowDown':
        target = rows[index + 1];
        break;
      case 'ArrowUp':
        target = rows[index - 1];
        break;
      case 'Home':
        target = rows[0];
        break;
      case 'End':
        target = rows[rows.length - 1];
        break;
      case forward:
        if (row.expandable && !row.expanded) this.setExpanded(row.node, true);
        else if (row.expanded && rows[index + 1]?.parent === row.node) target = rows[index + 1];
        break;
      case back:
        if (row.expanded) this.setExpanded(row.node, false);
        else if (row.parent) target = rows.find((r) => r.node === row.parent);
        break;
      case 'Enter':
        this.activate(row, 'enter');
        break;
      case ' ':
        this.activate(row, 'space');
        break;
      case '*':
        for (const sibling of rows.filter((r) => r.parent === row.parent && r.expandable)) {
          this.setExpanded(sibling.node, true);
        }
        break;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const letter = fold(event.key);
        const ordered = [...rows.slice(index + 1), ...rows.slice(0, index + 1)];
        target = ordered.find((r) => fold(r.node.label).startsWith(letter));
        if (!target) return;
      }
    }
    event.preventDefault();
    if (target) {
      this.activeId.set(target.node.id);
      this.focusActive();
    }
  }

  /** Lleva el foco al nodo activo después de renderizar (puede aparecer o moverse). */
  private focusActive(): void {
    afterNextRender(
      () => {
        const id = this.tabStop();
        const index = this.nodeRows().findIndex((row) => row.node.id === id);
        this.items()[index]?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }
}

/** Todo lo que hace falta para usar el Tree: `imports: [MimiTreeImports]`. */
export const MimiTreeImports = [MimiTree, MimiTreeNodeTemplate] as const;
