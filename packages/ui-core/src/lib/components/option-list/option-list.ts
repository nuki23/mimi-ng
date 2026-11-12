import { ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  type EmbeddedViewRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';

/*
 * Utilidades de lista (ítem `option-list` de la CLI, G2.8; decidido por defecto el 05/11/2026):
 * el filtro sin tildes ni mayúsculas, el resaltado de la coincidencia y la lista de opciones con
 * @angular/aria (Listbox dentro de un Combobox), con «cargando», «sin resultados» y una fila
 * «Crear». Salen de lo que Select tiene por dentro (`normalize()`, `MimiSelectHighlight`,
 * `MimiSelectList`); Select no se toca en la 0.3.0 y la M.9 lo migra a estas.
 *
 * Nada de aria sale en la API pública: la lista es de uso interno de los componentes de Mimi.
 */

/** Una opción de una lista. Tiene la misma forma que `MimiOption` de Select. */
export interface MimiListOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
  /** Texto atenuado de la derecha. */
  hint?: string;
}

/** Un grupo de opciones con su etiqueta. La misma forma que `MimiOptionGroup` de Select. */
export interface MimiListOptionGroup<T = unknown> {
  label: string;
  options: readonly MimiListOption<T>[];
}

/** Decide si una opción coincide con lo escrito. */
export type MimiListFilter<T = unknown> = (option: MimiListOption<T>, query: string) => boolean;

/**
 * Dónde se filtra lo que se busca en Select y Combobox: `'client'` (el componente, con `filterWith`
 * o el filtro sin tildes) o `'server'` (la app, al recibir `(searchChange)`: se muestra tal cual lo
 * que llega en las opciones).
 */
export type MimiSearchMode = 'client' | 'server';

/** Contexto de la plantilla propia de una opción: `let-option let-query="query"`. */
export interface MimiListOptionContext<T = unknown> {
  $implicit: MimiListOption<T>;
  /** Lo escrito (para resaltar). */
  query: string;
}

/** Un grupo declarativo: `<mimi-optgroup label="Europa">…<mimi-option>…</mimi-optgroup>`. */
@Component({
  selector: 'mimi-optgroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { hidden: '' },
  template: '<ng-content />',
})
export class MimiOptgroup {
  /** Etiqueta del grupo. No es `input.required` por lo mismo que `value` de `mimi-option`. */
  readonly label = input('');
}

/**
 * Una opción declarativa, alternativa a `[options]` en Select y Combobox:
 * `<mimi-option value="es" hint="UE">España</mimi-option>`. El texto es la etiqueta (o `label`).
 * El componente las lee y pinta él mismo; el elemento no se ve.
 */
@Component({
  selector: 'mimi-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { hidden: '' },
  template: '<ng-content />',
})
export class MimiOptionItem<T = unknown> {
  readonly value = input<T>();
  readonly label = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hint = input<string>();
  readonly group = inject(MimiOptgroup, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** Sube cuando cambia el texto de dentro, para que la lista relea la etiqueta. */
  private readonly textVersion = signal(0);

  constructor() {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(() => this.textVersion.update((v) => v + 1));
    observer.observe(this.host.nativeElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }

  /**
   * Lo que la lista pinta, o `null` mientras `value` no llegó. Con `[value]` enlazado (dentro de
   * un `@for`, por ejemplo) la lista puede leer la opción antes de que Angular le pase la entrada;
   * por eso `value` no es `input.required`: leer una requerida sin valor lanza NG0950 y rompía la
   * lista entera.
   */
  readonly option = computed<MimiListOption<T> | null>(() => {
    this.textVersion();
    const value = this.value();
    if (value === undefined) return null;
    return {
      label: this.label() ?? (this.host.nativeElement.textContent ?? '').trim(),
      value,
      disabled: this.disabled(),
      hint: this.hint(),
    };
  });
}

/** Las `<mimi-option>` en el orden del DOM, con las de un mismo `<mimi-optgroup>` juntas. */
export function mimiDeclaredOptions<T>(
  items: readonly MimiOptionItem<T>[],
): (MimiListOption<T> | MimiListOptionGroup<T>)[] {
  const result: (MimiListOption<T> | MimiListOptionGroup<T>)[] = [];
  const groups = new Map<MimiOptgroup, MimiListOption<T>[]>();
  for (const item of items) {
    const option = item.option();
    if (!option) continue;
    if (!item.group) {
      result.push(option);
      continue;
    }
    const existing = groups.get(item.group);
    if (existing) {
      existing.push(option);
    } else {
      const options: MimiListOption<T>[] = [option];
      groups.set(item.group, options);
      result.push({ label: item.group.label(), options });
    }
  }
  return result;
}

/** Minúsculas y sin tildes, para comparar textos. */
export function mimiNormalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Filtro predeterminado: la etiqueta contiene lo escrito, sin tildes ni mayúsculas. */
export const mimiDefaultListFilter: MimiListFilter = (option, query) =>
  mimiNormalizeText(option.label).includes(mimiNormalizeText(query));

/** Una fila de la lista, con su clave interna (aria compara por identidad). */
export interface MimiListRow<T = unknown> {
  /** Posición en la lista completa: estable aunque se filtre. */
  key: string;
  option: MimiListOption<T>;
}

/** Una sección: las opciones sueltas seguidas, o un grupo con su etiqueta. */
export interface MimiListSection<T = unknown> {
  id: string;
  label: string | null;
  rows: MimiListRow<T>[];
}

/** Arma las secciones (con claves internas) a partir de opciones sueltas o en grupos. */
export function mimiListSections<T>(
  options: readonly (MimiListOption<T> | MimiListOptionGroup<T>)[],
  idPrefix: string,
): MimiListSection<T>[] {
  const sections: MimiListSection<T>[] = [];
  let loose: MimiListSection<T> | null = null;
  let index = 0;
  const row = (option: MimiListOption<T>): MimiListRow<T> => ({ key: String(index++), option });
  for (const item of options) {
    const id = `${idPrefix}-group-${sections.length}`;
    if ('options' in item) {
      loose = null;
      sections.push({ id, label: item.label, rows: item.options.map(row) });
    } else {
      if (!loose) sections.push((loose = { id, label: null, rows: [] }));
      loose.rows.push(row(item));
    }
  }
  return sections;
}

/** Deja en cada sección las filas que pasan el filtro, y quita las secciones vacías. */
export function mimiFilterSections<T>(
  sections: MimiListSection<T>[],
  query: string,
  filter: MimiListFilter<T> = mimiDefaultListFilter as MimiListFilter<T>,
): MimiListSection<T>[] {
  if (!query) return sections;
  return sections
    .map((section) => ({ ...section, rows: section.rows.filter((r) => filter(r.option, query)) }))
    .filter((section) => section.rows.length > 0);
}

/**
 * Resalta en `text` la parte que coincide con `query` (negrita y subrayado, como el diseño):
 * `<mimi-highlight [text]="option.label" [query]="query" />`.
 */
@Component({
  selector: 'mimi-highlight',
  // Tres elementos pegados, sin @if: un salto de línea entre ellos sería un espacio en el texto.
  template: `<span>{{ parts().before }}</span
    ><mark class="bg-transparent font-bold text-inherit underline underline-offset-[3px]">{{
      parts().match
    }}</mark
    ><span>{{ parts().after }}</span>`,
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiHighlight {
  readonly text = input.required<string>();
  readonly query = input('');
  readonly userClass = input('', { alias: 'class' });

  protected readonly classes = computed(() => cn('min-w-0 truncate', this.userClass()));

  protected readonly parts = computed(() => {
    const text = this.text();
    const query = mimiNormalizeText(this.query());
    const start = query ? mimiNormalizeText(text).indexOf(query) : -1;
    if (start < 0) return { before: text, match: '', after: '' };
    const end = start + query.length;
    return { before: text.slice(0, start), match: text.slice(start, end), after: text.slice(end) };
  });
}

/**
 * Uso interno: pinta una plantilla de opción y actualiza su contexto sin recrearla (lo mismo que
 * NgTemplateOutlet, sin @angular/common).
 * @internal No forma parte de la API de Mimi.
 */
@Directive({ selector: '[mimiListOutlet]' })
export class MimiListOutlet {
  readonly template = input.required<TemplateRef<MimiListOptionContext>>({
    alias: 'mimiListOutlet',
  });
  readonly option = input.required<MimiListOption>({ alias: 'mimiListOutletOption' });
  readonly query = input('', { alias: 'mimiListOutletQuery' });

  private readonly viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<MimiListOptionContext> | null = null;
  private rendered: TemplateRef<MimiListOptionContext> | null = null;

  private readonly render = effect(() => {
    const template = this.template();
    const context = { $implicit: this.option(), query: this.query() };
    untracked(() => {
      if (this.view && this.rendered === template) {
        Object.assign(this.view.context, context);
        this.view.markForCheck();
        return;
      }
      this.viewContainer.clear();
      this.rendered = template;
      this.view = this.viewContainer.createEmbeddedView(template, context);
    });
  });
}

/** Clave de la fila «Crear». No choca con las de las opciones (son números). */
export const MIMI_LIST_CREATE_KEY = 'create';

const ICON = {
  viewBox: '0 0 24 24',
  check: 'M20 6 9 17l-5-5',
  plus: 'M5 12h14M12 5v14',
  spinner: 'M21 12a9 9 0 1 1-6.219-8.56',
} as const;

const GROUP_LABEL_CLASSES =
  'px-2 pt-1.5 pb-1 text-[11px] font-semibold tracking-[.05em] text-muted-foreground uppercase';
const CREATE_CLASSES =
  'mt-[3px] border-t border-border text-info-soft-foreground data-[active=true]:bg-info-soft';
const BOX_CLASSES =
  'inline-flex size-4 shrink-0 items-center justify-center rounded-[var(--mimi-radius-sm)] border border-input text-primary-foreground [&_svg]:size-3';
const BOX_CHECKED_CLASSES = cn(BOX_CLASSES, 'border-primary bg-primary');
const SKELETON_CLASSES =
  'h-[26px] rounded-[var(--mimi-radius-sm)] bg-muted animate-mimi-pulse motion-reduce:animate-none';

/**
 * Uso interno de los componentes con lista (Combobox; después Select, M.9): el `ngListbox` con
 * las opciones, la fila «Crear», «cargando» y «sin resultados». Va dentro de un
 * `ngComboboxPopup`: el listbox se registra en él por DI (`ngComboboxWidget`).
 *
 * El `value` del listbox es solo lo que se pinta (el check y `aria-selected`): el valor real es
 * del componente. Rodeo (como en Select): aria desmarca la opción elegida al volver a elegirla y
 * vacía el valor cuando la opción queda fuera del filtro; aquí se le vuelve a escribir.
 * @internal No forma parte de la API de Mimi.
 */
@Component({
  selector: 'mimi-option-list',
  imports: [Listbox, Option, ComboboxWidget, MimiListOutlet, MimiHighlight],
  template: `
    <div
      ngListbox
      ngComboboxWidget
      #listbox="ngListbox"
      focusMode="activedescendant"
      selectionMode="explicit"
      tabindex="-1"
      [multi]="multi()"
      [softDisabled]="false"
      [id]="listId()"
      [value]="paintedKeys()"
      [activeDescendant]="listbox.activeDescendant()"
      [attr.aria-label]="label() || null"
      [attr.aria-busy]="loading() || null"
      [class]="listClasses()"
      (valueChange)="resync()"
      (click)="onClick($event)"
      (pointermove)="onPointerMove($event)"
      (keydown)="keepFirst.set(false)"
    >
      @for (section of sections(); track section.id) {
        <div
          class="flex flex-col gap-px"
          [attr.role]="section.label ? 'group' : 'presentation'"
          [attr.aria-labelledby]="section.label ? section.id : null"
        >
          @if (section.label) {
            <span role="presentation" [id]="section.id" [class]="groupLabelClasses">{{
              section.label
            }}</span>
          }
          @for (row of section.rows; track row.key) {
            <div
              ngOption
              [id]="optionId(row.key)"
              [value]="row.key"
              [label]="row.option.label"
              [disabled]="!!row.option.disabled"
              [class]="optionClass()"
              [attr.data-key]="row.key"
              [attr.data-state]="isSelected(row.key) ? 'checked' : 'unchecked'"
            >
              @if (multi()) {
                <span
                  aria-hidden="true"
                  data-slot="checkbox"
                  [class]="isSelected(row.key) ? boxCheckedClasses : boxClasses"
                >
                  @if (isSelected(row.key)) {
                    <svg
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      [attr.viewBox]="icon.viewBox"
                    >
                      <path [attr.d]="icon.check" />
                    </svg>
                  }
                </span>
              }
              @if (optionTemplate(); as template) {
                <span class="flex min-w-0 flex-1 items-center gap-2">
                  <ng-container
                    [mimiListOutlet]="template"
                    [mimiListOutletOption]="row.option"
                    [mimiListOutletQuery]="query()"
                  />
                </span>
              } @else {
                <mimi-highlight class="flex-1" [text]="row.option.label" [query]="query()" />
              }
              @if (row.option.hint) {
                <span class="shrink-0 text-xs text-muted-foreground">{{ row.option.hint }}</span>
              }
              @if (!multi() && isSelected(row.key)) {
                <svg
                  aria-hidden="true"
                  class="size-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  [attr.viewBox]="icon.viewBox"
                >
                  <path [attr.d]="icon.check" />
                </svg>
              }
            </div>
          }
        </div>
      }
      @if (createLabel(); as create) {
        <div
          ngOption
          data-slot="create"
          [id]="optionId(createKey)"
          [value]="createKey"
          [label]="create"
          [class]="createClasses()"
          [attr.data-key]="createKey"
        >
          <svg
            aria-hidden="true"
            class="size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            <path [attr.d]="icon.plus" />
          </svg>
          <span class="min-w-0 flex-1 truncate">{{ create }}</span>
        </div>
      }
    </div>
    @if (loading()) {
      <div aria-hidden="true" data-slot="loading" class="flex flex-col gap-2 p-2">
        <span class="flex items-center gap-2 px-1 py-0.5 text-[13px] text-muted-foreground">
          <svg
            class="size-3.5 shrink-0 animate-[mimi-spin_0.8s_linear_infinite]"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.viewBox]="icon.viewBox"
          >
            <path [attr.d]="icon.spinner" />
          </svg>
          {{ loadingText() }}
        </span>
        <div [class]="skeletonClasses"></div>
        <div class="w-[72%]" [class]="skeletonClasses"></div>
      </div>
    }
    <div
      role="status"
      data-slot="status"
      [class]="empty() ? 'flex flex-col items-center gap-1 px-3 py-[18px] text-center' : 'sr-only'"
    >
      @if (empty()) {
        <svg
          aria-hidden="true"
          class="size-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          [attr.viewBox]="icon.viewBox"
        >
          <path d="m13.5 8.5-5 5" />
          <path d="m8.5 8.5 5 5" />
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span class="text-sm font-semibold">{{ emptyTitle() }}</span>
        @if (emptyText()) {
          <span class="text-[13px] text-muted-foreground">{{ emptyText() }}</span>
        }
      } @else {
        {{ status() }}
      }
    </div>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiOptionList {
  readonly sections = input.required<MimiListSection[]>();
  /** Claves elegidas (una en simple; varias con `multi`). */
  readonly selectedKeys = input<readonly string[]>([]);
  readonly multi = input(false, { transform: booleanAttribute });
  /** Lo escrito: resalta la coincidencia. */
  readonly query = input('');
  readonly loading = input(false, { transform: booleanAttribute });
  /** Texto de «cargando» (visible). Los lectores reciben `aria-busy` y el `status`. */
  readonly loadingText = input('');
  /** Título y texto de «sin resultados». Sin título, la lista vacía no muestra nada. */
  readonly emptyTitle = input('');
  readonly emptyText = input('');
  /** Texto de la región `status` cuando hay resultados (por ejemplo, «3 resultados»). */
  readonly status = input('');
  /** Con texto, agrega al final la fila «Crear» (clave `MIMI_LIST_CREATE_KEY`). */
  readonly createLabel = input<string | null>(null);
  readonly optionTemplate = input<TemplateRef<MimiListOptionContext> | null>(null);
  readonly listId = input.required<string>();
  readonly label = input('');
  /** Clases de la lista y de cada opción (literales, del componente que la usa). */
  readonly listClass = input('');
  readonly optionClass = input('');
  /** Se eligió con el puntero una opción habilitada (o «Crear»). */
  readonly pick = output<string>();

  private readonly listbox = viewChild.required<Listbox<string>>('listbox');

  protected readonly icon = ICON;
  protected readonly createKey = MIMI_LIST_CREATE_KEY;
  protected readonly groupLabelClasses = GROUP_LABEL_CLASSES;
  protected readonly createClasses = computed(() => cn(this.optionClass(), CREATE_CLASSES));
  protected readonly boxClasses = BOX_CLASSES;
  protected readonly boxCheckedClasses = BOX_CHECKED_CLASSES;
  protected readonly skeletonClasses = SKELETON_CLASSES;

  private readonly keys = computed(() => {
    const keys = this.sections().flatMap((section) => section.rows.map((row) => row.key));
    if (this.createLabel()) keys.push(MIMI_LIST_CREATE_KEY);
    return keys;
  });
  protected readonly empty = computed(
    () => !this.loading() && this.keys().length === 0 && !!this.emptyTitle(),
  );
  protected readonly listClasses = computed(() =>
    cn('flex flex-col gap-px overflow-y-auto p-1 outline-none', this.listClass(), {
      hidden: this.keys().length === 0,
    }),
  );

  /** Cambia para volver a escribir el valor en el listbox (un arreglo nuevo cada vez). */
  private readonly version = signal(0);
  protected readonly paintedKeys = computed(() => {
    this.version();
    const keys = this.keys();
    return this.selectedKeys().filter((key) => keys.includes(key));
  });

  protected isSelected(key: string): boolean {
    return this.selectedKeys().includes(key);
  }

  /** El activo cambió con el puntero: no hace falta traerlo a la vista. */
  private byPointer = false;

  /**
   * La primera opción habilitada sigue activa mientras se escribe, hasta que el usuario mueva la
   * activa con el teclado o el puntero (rodeo `keepFirst` de Select).
   */
  protected readonly keepFirst = signal(false);

  constructor() {
    afterRenderEffect({
      read: () => {
        if (!this.keepFirst()) return;
        this.keys();
        const listbox = this.listbox();
        listbox.activeDescendant();
        untracked(() => listbox.gotoFirst());
      },
    });
    afterRenderEffect({
      read: () => {
        const listbox = this.listbox();
        if (!listbox.activeDescendant()) return;
        if (this.byPointer) this.byPointer = false;
        else listbox.scrollActiveItemIntoView();
      },
    });
  }

  protected optionId(key: string): string {
    return `${this.listId()}-${key}`;
  }

  protected resync(): void {
    this.version.update((version) => version + 1);
  }

  /** Clave de la opción activa (la del `aria-activedescendant`), o null. */
  activeKey(): string | null {
    const id = this.listbox().activeDescendant();
    return id ? id.slice(this.listId().length + 1) : null;
  }

  /** Activa la primera opción habilitada (al escribir). */
  gotoFirst(): void {
    this.keepFirst.set(true);
  }

  private optionAt(event: Event): HTMLElement | null {
    return (event.target as Element | null)?.closest<HTMLElement>('[role="option"]') ?? null;
  }

  /** Rodeo: el listbox no avisa qué opción se eligió. Solo cuentan las habilitadas. */
  protected onClick(event: MouseEvent): void {
    const option = this.optionAt(event);
    const key = option?.dataset['key'];
    if (key !== undefined && option?.getAttribute('aria-disabled') !== 'true') this.pick.emit(key);
  }

  /** El puntero activa la opción, como en el diseño (aria solo la activa con el teclado). */
  protected onPointerMove(event: PointerEvent): void {
    const option = this.optionAt(event);
    const key = option?.dataset['key'];
    if (key === undefined || option?.dataset['active'] === 'true') return;
    if (option?.getAttribute('aria-disabled') === 'true') return;
    this.byPointer = true;
    this.keepFirst.set(false);
    this.listbox().gotoIndex(this.keys().indexOf(key));
  }
}
