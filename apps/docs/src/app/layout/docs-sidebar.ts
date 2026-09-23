import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DOCS_NAV, type DocsNavSection } from './docs-nav';

/** Navegación de la documentación, generada desde DOCS_NAV. Se usa en escritorio y en el panel móvil. */
@Component({
  selector: 'app-docs-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './docs-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsSidebar {
  readonly sections = input<DocsNavSection[]>(DOCS_NAV);
}
