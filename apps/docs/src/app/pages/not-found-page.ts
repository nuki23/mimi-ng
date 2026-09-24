import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MimiButton } from '@mimi-ng/ui-core';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, MimiButton],
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
        <a mimiBtn routerLink="/docs"> Ir a la documentación </a>
        <a mimiBtn variant="outline" routerLink="/"> Volver al inicio </a>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
