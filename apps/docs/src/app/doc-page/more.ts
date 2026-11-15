import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Desplegable común de las páginas (regla 12 de la plantilla): `<details>` nativo, cerrado por
 * defecto. Lo que va dentro es para el usuario, pero no hace falta verlo de entrada: «Qué
 * instala», la matriz variante × tono, las listas largas de teclado.
 */
@Component({
  selector: 'app-more',
  template: `
    <details class="group rounded-card border bg-card" data-slot="more">
      <summary
        class="flex cursor-pointer list-none items-center gap-2 rounded-card px-4 py-2.5 text-sm font-medium select-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden"
      >
        <svg
          aria-hidden="true"
          class="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90 motion-reduce:transition-none rtl:-scale-x-100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        {{ summary() }}
      </summary>
      <div class="flex flex-col gap-3 border-t px-4 py-3 text-pretty">
        <ng-content />
      </div>
    </details>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class More {
  /** El texto del desplegable. */
  readonly summary = input.required<string>();
}
