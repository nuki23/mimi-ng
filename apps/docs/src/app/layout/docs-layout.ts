import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LucideChevronRight } from '@lucide/angular';
import { filter, map } from 'rxjs';
import { findDocsNavEntry } from './docs-nav';
import { DocsSidebar } from './docs-sidebar';
import { DocsToc } from './docs-toc';

/** Layout de la documentación: sidebar, contenido con migas y TOC (spec, sección 10). */
@Component({
  selector: 'app-docs-layout',
  imports: [RouterOutlet, DocsSidebar, DocsToc, LucideChevronRight],
  templateUrl: './docs-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsLayout {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly crumb = computed(() => findDocsNavEntry(this.url()));
}
