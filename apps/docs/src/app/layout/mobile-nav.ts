import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  type ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { MimiButton } from '@/components/ui/button';
import { filter } from 'rxjs';
import { DocsSidebar } from './docs-sidebar';
import { MobileNavService } from './mobile-nav.service';

/**
 * Panel de navegación para pantallas menores a lg. Es un <dialog> modal nativo: el resto de
 * la página queda inerte (el foco no sale del panel), Escape lo cierra y el foco vuelve al
 * botón que lo abrió. También se cierra con un clic en el fondo o al navegar. Mientras está
 * abierto, la página no hace scroll.
 */
@Component({
  selector: 'app-mobile-nav',
  imports: [DocsSidebar, MimiButton],
  templateUrl: './mobile-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNav {
  protected readonly nav = inject(MobileNavService);
  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  /** overflow que tenía <html> antes de abrir; null = no está bloqueado. */
  private previousOverflow: string | null = null;

  private readonly syncDialog = effect(() => {
    const dialog = this.dialog().nativeElement;
    if (this.nav.isOpen()) {
      this.lockScroll();
      if (!dialog.open) {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
    } else {
      if (dialog.open) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
      this.unlockScroll();
    }
  });

  private readonly closeOnNavigation = inject(Router)
    .events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe(() => this.nav.close());

  /** Desde lg el panel se oculta (lg:hidden): si estaba abierto, se cierra para no dejar la página inerte. */
  private readonly closeOnDesktop = (() => {
    const media = this.document.defaultView?.matchMedia?.('(min-width: 64rem)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) this.nav.close();
    };
    media?.addEventListener('change', onChange);
    return () => media?.removeEventListener('change', onChange);
  })();

  private readonly restoreOnDestroy = inject(DestroyRef).onDestroy(() => {
    this.closeOnDesktop();
    this.unlockScroll();
    this.nav.close();
  });

  /** Clic en el fondo: el objetivo es el propio <dialog>, no el panel que lleva dentro. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.nav.close();
  }

  private lockScroll(): void {
    if (this.previousOverflow !== null) return;
    const html = this.document.documentElement;
    this.previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
  }

  private unlockScroll(): void {
    if (this.previousOverflow === null) return;
    this.document.documentElement.style.overflow = this.previousOverflow;
    this.previousOverflow = null;
  }
}
