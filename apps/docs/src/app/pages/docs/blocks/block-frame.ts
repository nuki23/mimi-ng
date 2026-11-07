import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';
import { ThemeService } from '../../../core/theme.service';

export interface BlockState {
  id: string;
  label: string;
}

/** Ancho del marco móvil (el del diseño de los Blocks, `F6 Blocks`). */
export const MOBILE_WIDTH = 375;

/**
 * Vista previa de un Block (B.1-g): un `iframe` con la ruta `/preview/blocks/<nombre>`, para que
 * el Block responda al ancho del marco (`md:`, `lg:`) y no al de la ventana. Ancho escritorio o
 * móvil, el estado (`?state=`) y claro u oscuro: por defecto el del sitio; se aplica en el
 * `<html>` del documento del iframe (es del mismo origen).
 */
@Component({
  selector: 'app-block-frame',
  imports: [MimiToggleGroupImports],
  template: `
    <div class="flex flex-wrap items-center gap-3">
      <mimi-toggle-group aria-label="Ancho de la vista previa" [(value)]="width">
        <button mimiToggleGroupItem="desktop">Escritorio</button>
        <button mimiToggleGroupItem="mobile">Móvil ({{ mobileWidth }} px)</button>
      </mimi-toggle-group>
      <mimi-toggle-group aria-label="Modo de la vista previa" [(value)]="mode">
        <button mimiToggleGroupItem="light">Claro</button>
        <button mimiToggleGroupItem="dark">Oscuro</button>
      </mimi-toggle-group>
      @if (states().length > 0) {
        <mimi-toggle-group aria-label="Estado del Block" [(value)]="state">
          <button mimiToggleGroupItem="">Normal</button>
          @for (option of states(); track option.id) {
            <button [mimiToggleGroupItem]="option.id">{{ option.label }}</button>
          }
        </mimi-toggle-group>
      }
      <a
        class="ms-auto text-sm font-medium text-primary underline-offset-4 hover:underline"
        [href]="path()"
        target="_blank"
        rel="noopener"
        >Abrir en una pestaña</a
      >
    </div>
    <div class="mt-3 overflow-hidden rounded-card border bg-muted" [attr.data-width]="width()">
      <iframe
        #frame
        class="mx-auto block h-[760px] border-0 bg-background"
        [class.w-full]="width() !== 'mobile'"
        [style.width.px]="width() === 'mobile' ? mobileWidth : null"
        [src]="src()"
        [title]="'Vista previa de ' + name()"
        (load)="applyMode()"
      ></iframe>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockFrame {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly theme = inject(ThemeService);

  /** Nombre del Block en el registro, p. ej. `login-01`. */
  readonly name = input.required<string>();
  /** Estados que se pueden elegir (entradas del Block en `BLOCK_PREVIEWS`). */
  readonly states = input<BlockState[]>([]);

  protected readonly mobileWidth = MOBILE_WIDTH;
  protected readonly width = signal<string | null>('desktop');
  protected readonly state = signal<string | null>('');
  /** Sigue al sitio hasta que se elige otro en el marco. */
  protected readonly mode = linkedSignal<string | null>(() =>
    this.theme.isDark() ? 'dark' : 'light',
  );

  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');

  protected readonly path = computed(() => {
    const state = this.state();
    return `/preview/blocks/${this.name()}${state ? `?state=${encodeURIComponent(state)}` : ''}`;
  });
  // Ruta propia del sitio, del mismo origen: no viene del usuario.
  protected readonly src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.path()),
  );

  constructor() {
    effect(() => this.applyMode());
  }

  /** La clase `.dark` va en el `<html>` del iframe, no en el del sitio. */
  protected applyMode(): void {
    const dark = this.mode() === 'dark';
    const html = this.frame()?.nativeElement.contentDocument?.documentElement;
    html?.classList.toggle('dark', dark);
  }
}
