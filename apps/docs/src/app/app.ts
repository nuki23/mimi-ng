import { ChangeDetectionStrategy, Component, type ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileNav } from './layout/mobile-nav';
import { SiteHeader } from './layout/site-header';

@Component({
  imports: [RouterOutlet, SiteHeader, MobileNav],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  /** El enlace no usa href="#contenido": con <base href="/"> navegaría a la raíz. */
  protected skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.main().nativeElement;
    main.focus();
    main.scrollIntoView();
  }
}
