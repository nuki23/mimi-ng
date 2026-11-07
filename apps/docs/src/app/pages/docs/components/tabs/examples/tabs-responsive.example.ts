import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-responsive-example',
  imports: [MimiTabsImports],
  template: `
    <!-- Vertical desde 768px, horizontal en pantallas chicas: la orientación cambia en vivo. -->
    <mimi-tabs
      [orientation]="wide() ? 'vertical' : 'horizontal'"
      aria-label="Secciones"
      [class]="wide() ? 'w-40' : ''"
    >
      <ng-template mimiTab="general" label="General">Idioma y zona horaria.</ng-template>
      <ng-template mimiTab="equipo" label="Equipo">Miembros e invitaciones.</ng-template>
      <ng-template mimiTab="pagos" label="Pagos">Plan y facturas.</ng-template>
    </mimi-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsResponsiveExample {
  private readonly media = inject(DOCUMENT).defaultView?.matchMedia?.('(min-width: 768px)') ?? null;
  protected readonly wide = signal(this.media?.matches ?? true);

  constructor() {
    const onChange = (event: MediaQueryListEvent) => this.wide.set(event.matches);
    this.media?.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));
  }
}
