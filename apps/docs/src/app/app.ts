import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MobileNav } from './layout/mobile-nav';
import { SiteHeader } from './layout/site-header';

/** Rutas que se muestran sin el shell del sitio (la vista previa de los Blocks, B.1-g). */
const isPreview = (url: string) => url.startsWith('/preview/');

@Component({
  imports: [RouterOutlet, SiteHeader, MobileNav],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly main = viewChild<ElementRef<HTMLElement>>('main');

  /**
   * Sin el header ni el menú. Empieza con la URL del documento (antes de la primera navegación
   * el router todavía no la tiene), para que el iframe no pinte el shell ni un instante.
   */
  protected readonly preview = signal(
    isPreview(inject(DOCUMENT).defaultView?.location.pathname ?? ''),
  );

  constructor() {
    inject(Router).events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.preview.set(isPreview(event.urlAfterRedirects));
    });
  }

  /** El enlace no usa href="#contenido": con <base href="/"> navegaría a la raíz. */
  protected skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.main()?.nativeElement;
    if (!main) return;
    main.focus();
    main.scrollIntoView();
  }
}
