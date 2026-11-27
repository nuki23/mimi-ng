import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { MimiAvatar, MimiAvatarFallback } from '@/components/ui/avatar';
import { MimiBadge, type MimiBadgeTone } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { type MimiSortableMove, MimiSortableListImports } from '@/components/ui/sortable-list';
import { restoreFocusAfterBusy } from '@/components/ui/utils/busy';
import { cn } from '@/components/ui/utils/cn';

/** Una tarjeta del tablero. */
export interface Kanban01Card {
  /** Identificador estable (sale en `moved`). */
  id: string | number;
  title: string;
  /** Etiqueta (un Badge suave con su tono). */
  tag?: { label: string; tone?: MimiBadgeTone };
  /** Responsable (un Avatar con sus iniciales). */
  assignee?: { name: string };
}

/** Una columna: sus tarjetas, en orden, y un tope opcional («no más de 3 en curso»). */
export interface Kanban01Column {
  id: string;
  title: string;
  cards: Kanban01Card[];
  /** Cuántas tarjetas admite como mucho. Sin él, sin tope. */
  limit?: number;
}

/** El tablero de ejemplo, para que la pantalla funcione sin datos. */
export const KANBAN_01_COLUMNS: Kanban01Column[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      {
        id: 1,
        title: 'Audit color contrast',
        tag: { label: 'Design', tone: 'info' },
        assignee: { name: 'Ana Torres' },
      },
      {
        id: 2,
        title: 'Write the release notes',
        tag: { label: 'Docs' },
        assignee: { name: 'Luis Gil' },
      },
      { id: 3, title: 'Migrate the settings page', tag: { label: 'Frontend', tone: 'primary' } },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    limit: 3,
    cards: [
      {
        id: 4,
        title: 'Connected sortable lists',
        tag: { label: 'Frontend', tone: 'primary' },
        assignee: { name: 'Marta Ruiz' },
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      {
        id: 5,
        title: 'Card as a surface',
        tag: { label: 'Design', tone: 'info' },
        assignee: { name: 'Ana Torres' },
      },
    ],
  },
];

/**
 * kanban-01 (Block de Mimi): un tablero con columnas («To do», «In progress», «Done»), tarjetas con
 * título, etiqueta y responsable, y el movimiento entre columnas con el puntero, el dedo y el
 * teclado (Sortable List con listas conectadas, R.21). En móvil, las columnas se desplazan en
 * horizontal y se detienen en cada una.
 *
 * Es una página: `ng g mimi kanban-01` la genera en tu carpeta de páginas (`aliases.pages` de
 * mimi.json; por defecto, `src/app/pages/kanban/`, u otro nombre con `--name`) junto con su
 * archivo de rutas (`kanban.routes.ts`, con la página en carga diferida), y te da la línea para
 * `app.routes.ts`:
 *
 * ```ts
 * { path: 'kanban', loadChildren: () => import('./pages/kanban/kanban.routes').then((m) => m.KANBAN_ROUTES) },
 * ```
 *
 * El Block no guarda nada: `[(columns)]` es tuyo (cambia al mover una tarjeta) y `(moved)` dice
 * qué se movió, para tu servidor.
 *
 * ```html
 * <mimi-kanban-01 [(columns)]="board" (moved)="save($event)" (addCard)="create($event)" />
 * ```
 */
@Component({
  selector: 'mimi-kanban-01',
  imports: [MimiAvatar, MimiAvatarFallback, MimiBadge, MimiButton, MimiSortableListImports],
  templateUrl: './kanban-01.html',
  host: {
    '[class]': 'classes()',
    // Cargando: nada se puede mover, pulsar ni enfocar (R.11).
    '[attr.data-state]': 'loading() ? "loading" : null',
    '[attr.inert]': 'loading() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Kanban01 {
  /** Las columnas con sus tarjetas. Admite `[(columns)]`: cambia al mover una tarjeta. */
  readonly columns = model<Kanban01Column[]>(KANBAN_01_COLUMNS);
  readonly heading = input('Board');
  readonly description = input(
    'Drag cards between columns, or grab one with Space and use the arrow keys.',
  );
  readonly loading = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  /** Una tarjeta pasó a otra columna (`from.list` y `to.list` son los `id` de las columnas). */
  readonly moved = output<MimiSortableMove<Kanban01Card>>();
  /** Una tarjeta cambió de lugar en su columna. */
  readonly reordered = output<{ column: string; card: Kanban01Card; from: number; to: number }>();
  /** «Add card» de una columna (su `id`): crear la tarjeta es de tu app. */
  readonly addCard = output<string>();

  private readonly focusBack = restoreFocusAfterBusy(this.loading);

  protected readonly classes = computed(() =>
    // El contenedor de los Blocks de página (table-01: px-4 / md:px-8, pt-5 / md:pt-7) con el ancho
    // del contenido de pricing-01 (1080 px), centrado.
    cn(
      'mx-auto flex w-full max-w-[1080px] min-w-0 flex-col gap-5 px-4 pt-5 pb-8 font-sans text-foreground md:px-8 md:pt-7 md:pb-10',
      this.userClass(),
    ),
  );

  protected readonly title = (card: Kanban01Card) => card.title;
  protected readonly byId = (card: Kanban01Card) => card.id;

  /** Si la columna admite una tarjeta más (su `limit`). */
  protected acceptsFor(column: Kanban01Column): () => boolean {
    return () => column.limit === undefined || this.cardsOf(column.id).length < column.limit;
  }

  private cardsOf(id: string): Kanban01Card[] {
    return this.columns().find((c) => c.id === id)?.cards ?? [];
  }

  protected setCards(id: string, cards: Kanban01Card[]): void {
    this.columns.update((columns) => columns.map((c) => (c.id === id ? { ...c, cards } : c)));
  }

  protected onMoved(move: MimiSortableMove<unknown>): void {
    this.moved.emit(move as MimiSortableMove<Kanban01Card>);
  }

  protected onReordered(
    column: string,
    event: { item: Kanban01Card; previousIndex: number; currentIndex: number },
  ): void {
    this.reordered.emit({
      column,
      card: event.item,
      from: event.previousIndex,
      to: event.currentIndex,
    });
  }

  /** «3 cards», «1 card», «2 of 3 cards»: el número de tarjetas para los lectores de pantalla. */
  protected countText(column: Kanban01Column): string {
    const n = column.cards.length;
    if (column.limit !== undefined) return `${n} of ${column.limit} cards`;
    return `${n} ${n === 1 ? 'card' : 'cards'}`;
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
