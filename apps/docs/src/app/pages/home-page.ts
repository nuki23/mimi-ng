import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MimiButton } from '@/components/ui/button';

/** Placeholder de la página de inicio: la landing real es la tarea 2.12. */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, MimiButton],
  template: `
    <section class="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 class="text-[38px] leading-[1.15] font-extrabold tracking-[-0.03em]">Mimi</h1>
      <p class="text-lg text-pretty text-muted-foreground">
        Componentes para Angular 22 y Tailwind CSS 4 que se copian a tu proyecto. Los componentes
        son tuyos. Las actualizaciones también.
      </p>
      <a mimiBtn routerLink="/docs"> Ver la documentación </a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
