import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Directionality } from '@angular/cdk/bidi';
import { Directive, InjectionToken, inject, output } from '@angular/core';

/*
 * Grupo de listas ordenables (R.21): las `mimi-sortable-list` de dentro quedan conectadas, así un
 * elemento pasa de una a otra con el puntero, el dedo (cdk `CdkDropListGroup`) y el teclado
 * (← → con el elemento agarrado). Cada lista conserva su `[(items)]`: no hay un modelo central.
 */

/** Un lugar de un elemento: la lista (su `listId`) y la posición. */
export interface MimiSortablePlace {
  list: string | undefined;
  index: number;
}

/** Lo que emiten `moved` (en la lista de destino y en el grupo) al pasar de una lista a otra. */
export interface MimiSortableMove<T = unknown> {
  item: T;
  from: MimiSortablePlace;
  to: MimiSortablePlace;
}

/**
 * Lo que el grupo necesita de cada lista (la implementa `MimiSortableList`).
 * @internal No forma parte de la API de Mimi.
 */
export interface MimiSortableGroupMember<T = unknown> {
  readonly host: HTMLElement;
  snapshot(): T[];
  restore(items: T[]): void;
  /** Dónde tiene el elemento agarrado (o `null`). */
  grabbedAt(): number | null;
  /** Vacía su región de anuncios (al soltar o cancelar en otra lista). */
  clearAnnouncement(): void;
}

/**
 * El agarre con el teclado, compartido por las listas del grupo: de dónde salió y cómo estaba
 * cada lista (para que Escape lo devuelva todo).
 * @internal
 */
export interface MimiSortableGrab<T = unknown> {
  origin: MimiSortableGroupMember<T>;
  originIndex: number;
  item: T;
  snapshot: Map<MimiSortableGroupMember<T>, T[]>;
}

/** @internal */
export const MIMI_SORTABLE_GROUP = new InjectionToken<MimiSortableGroup>('MIMI_SORTABLE_GROUP');

/**
 * `<mimi-sortable-group>` (o `[mimiSortableGroup]` en tu contenedor) alrededor de varias listas:
 *
 * ```html
 * <mimi-sortable-group class="grid grid-cols-3 gap-4" (moved)="guardar($event)">
 *   @for (col of columnas; track col.id) {
 *     <mimi-sortable-list [listId]="col.id" [aria-label]="col.titulo" [(items)]="col.tareas" />
 *   }
 * </mimi-sortable-group>
 * ```
 */
@Directive({
  selector: 'mimi-sortable-group, [mimiSortableGroup]',
  hostDirectives: [CdkDropListGroup],
  providers: [{ provide: MIMI_SORTABLE_GROUP, useExisting: MimiSortableGroup }],
  // Sin estilos propios: el reparto (columnas, `grid`, `flex`, `overflow-x-auto`) es tuyo, con `class`.
  host: { 'data-slot': 'sortable-group' },
})
export class MimiSortableGroup {
  /** Un elemento pasó de una lista a otra (puntero, dedo o teclado). */
  readonly moved = output<MimiSortableMove<unknown>>();

  private readonly dir = inject(Directionality, { optional: true });
  private readonly members = new Set<MimiSortableGroupMember>();
  /** @internal */
  grab: MimiSortableGrab | null = null;

  /** @internal */
  register(member: MimiSortableGroupMember): void {
    this.members.add(member);
  }

  /** @internal */
  unregister(member: MimiSortableGroupMember): void {
    this.members.delete(member);
    if (this.grab?.origin === member) this.grab = null;
  }

  /** @internal Empieza un agarre: guarda cómo está cada lista. */
  start<T>(origin: MimiSortableGroupMember<T>, index: number, item: T): MimiSortableGrab<T> {
    const snapshot = new Map<MimiSortableGroupMember, unknown[]>();
    for (const member of this.members) snapshot.set(member, member.snapshot());
    this.grab = { origin, originIndex: index, item, snapshot } as MimiSortableGrab;
    return this.grab as MimiSortableGrab<T>;
  }

  /** @internal La lista que tiene ahora el elemento agarrado. */
  holder(): MimiSortableGroupMember | null {
    for (const member of this.members) if (member.grabbedAt() !== null) return member;
    return null;
  }

  /** @internal Vacía los anuncios de todas las listas menos `keep` (no quedan mensajes viejos). */
  clearOthers(keep: MimiSortableGroupMember): void {
    for (const member of this.members) if (member !== keep) member.clearAnnouncement();
  }

  /**
   * @internal La lista de al lado en el orden del documento (← la anterior, → la siguiente; en
   * RTL al revés), o `null` si no hay.
   */
  neighbor(
    of: MimiSortableGroupMember,
    key: 'ArrowLeft' | 'ArrowRight',
  ): MimiSortableGroupMember | null {
    const ordered = [...this.members].sort((a, b) =>
      a.host.compareDocumentPosition(b.host) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
    // La dirección del documento donde está la lista (el `dir` más cercano), como la lista.
    const rtl = (of.host.closest('[dir]')?.getAttribute('dir') ?? this.dir?.value) === 'rtl';
    const step = (key === 'ArrowRight') !== rtl ? 1 : -1;
    const at = ordered.indexOf(of);
    return ordered[at + step] ?? null;
  }
}
