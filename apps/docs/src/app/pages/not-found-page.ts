import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
      <p class="font-mono text-sm text-muted-foreground">404</p>
      <h1 class="text-[38px] leading-[1.15] font-extrabold tracking-[-0.03em]">
        Esta página no existe
      </h1>
      <p class="text-pretty text-muted-foreground">
        Puede que la dirección esté mal escrita o que la página todavía no se haya creado.
      </p>
      <div class="flex flex-wrap justify-center gap-3">
        <a
          routerLink="/docs"
          class="inline-flex h-(--mimi-control-height) items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-primary mimi-transition hover:bg-primary-hover hover:shadow-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-(--mimi-press-scale)"
        >
          Ir a la documentación
        </a>
        <a
          routerLink="/"
          class="inline-flex h-(--mimi-control-height) items-center rounded-lg border bg-card px-4 text-sm font-medium shadow-neutral mimi-transition hover:bg-accent hover:shadow-neutral-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-(--mimi-press-scale)"
        >
          Volver al inicio
        </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
