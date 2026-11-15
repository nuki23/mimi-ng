import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../core/theme.service';
import { SITE } from '../site';
import { SiteIconButton } from './icon-button';
import { MobileNavService } from './mobile-nav.service';

/**
 * Header fijo y translúcido del showcase (spec, sección 10). Sus botones usan `appIconBtn` (el
 * aspecto de Button sin Button ni `tailwind-merge`, para que no vayan en `main`; M.25).
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, SiteIconButton],
  templateUrl: './site-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  protected readonly theme = inject(ThemeService);
  protected readonly mobileNav = inject(MobileNavService);
  protected readonly site = SITE;
}
