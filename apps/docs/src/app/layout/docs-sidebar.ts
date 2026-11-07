import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { DocsNavSection } from './docs-nav';

/**
 * Navegación de la documentación, generada desde DOCS_NAV. Se usa en escritorio (DocsLayout) y
 * en el panel móvil. Recibe las secciones (no importa DOCS_NAV): así el panel móvil, que vive
 * en main, las carga al abrirse y DOCS_NAV no viaja en main (M.13).
 */
@Component({
  selector: 'app-docs-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './docs-sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsSidebar {
  readonly sections = input.required<DocsNavSection[]>();
}
