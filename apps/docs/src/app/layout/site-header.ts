import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMenu, LucideMoon, LucideSun } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { ThemeService } from '../core/theme.service';
import { SITE } from '../site';
import { MobileNavService } from './mobile-nav.service';

/** Header fijo y translúcido del showcase (spec, sección 10). */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, MimiButton, LucideMenu, LucideMoon, LucideSun],
  templateUrl: './site-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  protected readonly theme = inject(ThemeService);
  protected readonly mobileNav = inject(MobileNavService);
  protected readonly site = SITE;
}
