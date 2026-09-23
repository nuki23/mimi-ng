import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Espacio del header fijo (60px) más un margen, para decidir qué sección está a la vista. */
const HEADER_OFFSET = 76;

/** Lee los h2 y h3 con id de un contenedor, en orden. */
export function readTocItems(container: ParentNode): TocItem[] {
  return Array.from(container.querySelectorAll<HTMLElement>('h2[id], h3[id]')).map((heading) => ({
    id: heading.id,
    text: heading.textContent?.trim() ?? '',
    level: heading.tagName === 'H3' ? 3 : 2,
  }));
}

/**
 * Tabla de contenidos automática: observa el contenido de la página (MutationObserver, así
 * funciona con rutas lazy y al cambiar de ruta) y resalta la sección visible
 * (IntersectionObserver). Si la página no tiene encabezados, no se muestra.
 */
@Component({
  selector: 'app-docs-toc',
  imports: [RouterLink],
  templateUrl: './docs-toc.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsToc {
  readonly content = input.required<HTMLElement>();

  protected readonly items = signal<TocItem[]>([]);
  protected readonly activeId = signal<string | null>(null);

  private readonly destroyRef = inject(DestroyRef);
  private intersection: IntersectionObserver | null = null;
  private readonly visible = new Set<string>();

  private readonly setup = afterNextRender(() => {
    const content = this.content();
    const mutation = new MutationObserver(() => this.scan());
    mutation.observe(content, { childList: true, subtree: true, characterData: true });
    this.scan();
    this.destroyRef.onDestroy(() => {
      mutation.disconnect();
      this.intersection?.disconnect();
    });
  });

  private scan(): void {
    const content = this.content();
    const items = readTocItems(content);
    const same =
      items.length === this.items().length &&
      items.every(
        (item, i) => item.id === this.items()[i].id && item.text === this.items()[i].text,
      );
    if (same) return;

    this.items.set(items);
    this.activeId.set(items[0]?.id ?? null);
    this.observeHeadings(content, items);
  }

  private observeHeadings(content: HTMLElement, items: TocItem[]): void {
    this.intersection?.disconnect();
    this.visible.clear();
    if (items.length === 0 || typeof IntersectionObserver === 'undefined') return;

    this.intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.visible.add(entry.target.id);
          else this.visible.delete(entry.target.id);
        }
        const first = this.items().find((item) => this.visible.has(item.id));
        if (first) this.activeId.set(first.id);
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px` },
    );
    for (const item of items) {
      const heading = content.querySelector(`#${CSS.escape(item.id)}`);
      if (heading) this.intersection.observe(heading);
    }
  }
}
