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
  selector: 'app-tabs-vertical-example',
  imports: [MimiTabsImports],
  template: `
    <!-- Vertical desde 768px (↑/↓ y el panel al lado); horizontal en pantallas chicas. -->
    <div class="flex w-full flex-col gap-8">
      <mimi-tabs [orientation]="orientation()" aria-label="Ajustes" [class]="wide() ? 'w-40' : ''">
        <ng-template mimiTab="perfil" label="Perfil">Nombre, usuario y biografía.</ng-template>
        <ng-template mimiTab="avisos" label="Notificaciones">Correo y push.</ng-template>
        <ng-template mimiTab="seguridad" label="Seguridad">Dos pasos y sesiones.</ng-template>
      </mimi-tabs>
      <mimi-tabs
        [orientation]="orientation()"
        variant="pill"
        aria-label="Ajustes (píldora)"
        [class]="wide() ? 'w-44' : ''"
      >
        <ng-template mimiTab="perfil" label="Perfil">Nombre, usuario y biografía.</ng-template>
        <ng-template mimiTab="avisos" label="Notificaciones">Correo y push.</ng-template>
        <ng-template mimiTab="seguridad" label="Seguridad">Dos pasos y sesiones.</ng-template>
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsVerticalExample {
  private readonly media = inject(DOCUMENT).defaultView?.matchMedia?.('(min-width: 768px)') ?? null;
  protected readonly wide = signal(this.media?.matches ?? true);
  protected readonly orientation = () => (this.wide() ? 'vertical' : 'horizontal');

  constructor() {
    const onChange = (event: MediaQueryListEvent) => this.wide.set(event.matches);
    this.media?.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));
  }
}
