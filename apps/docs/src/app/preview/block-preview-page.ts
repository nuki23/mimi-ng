import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ViewContainerRef,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  MIMI_ERROR_MESSAGES_EN,
  provideMimiErrorMessages,
} from '@/components/ui/form-field/error-messages';
import { THEME_STORAGE_KEY } from '../core/theme.service';
import { BLOCK_PREVIEWS } from './block-previews';

/** Hoja con las clases de los Blocks (angular.json, `inject: false`; B.1-h). */
export const BLOCKS_STYLESHEET = 'blocks.css';

/**
 * Vista previa de un Block a pantalla completa, sin el header ni el menú del sitio (los oculta
 * App). La carga el `iframe` de la página del Block. Carga la hoja de los Blocks, que no está en el
 * CSS global del sitio, y sigue el modo claro/oscuro: el de `?theme=`, o el del sitio (el marco lo
 * cambia en el documento del iframe, y la elección guardada llega con el evento `storage`).
 *
 * El Block se crea con `ViewContainerRef` y no con `NgComponentOutlet`: este vive en
 * `@angular/common`, que va en el chunk inicial, y sumaba ~2,4 kB al JS inicial (spec 10).
 * Cada cambio de URL vuelve a crear la página (el iframe la carga una vez por estado).
 */
@Component({
  selector: 'app-block-preview-page',
  // Los Blocks están en inglés (B.1-i): sus mensajes de error también, aunque el sitio esté en
  // español (app.config). Archivo concreto, sin form-field.
  providers: [provideMimiErrorMessages(MIMI_ERROR_MESSAGES_EN)],
  template: `
    @if (missing()) {
      <p class="p-8 text-muted-foreground">No hay ningún Block llamado «{{ name }}».</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockPreviewPage {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  /** El Block va justo después de esta página (el mismo lugar del router-outlet). */
  private readonly outlet = inject(ViewContainerRef);

  protected readonly name = this.route.snapshot.paramMap.get('name') ?? '';
  protected readonly missing = signal(false);

  constructor() {
    this.addStylesheet();
    this.followTheme();
    const preview = BLOCK_PREVIEWS[this.name];
    if (!preview) {
      this.missing.set(true);
      return;
    }
    const state = this.route.snapshot.queryParamMap.get('state');
    const inputs = (state && preview.states?.[state]) || {};
    void preview.load().then((block) => {
      const ref = this.outlet.createComponent(block);
      for (const [name, value] of Object.entries(inputs)) ref.setInput(name, value);
    });
  }

  private addStylesheet(): void {
    const head = this.document.head;
    if (head.querySelector('link[data-mimi-blocks]')) return;
    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BLOCKS_STYLESHEET;
    link.dataset['mimiBlocks'] = '';
    head.appendChild(link);
  }

  private followTheme(): void {
    const html = this.document.documentElement;
    const forced = this.route.snapshot.queryParamMap.get('theme');
    if (forced === 'dark' || forced === 'light') {
      html.classList.toggle('dark', forced === 'dark');
      return;
    }
    const window = this.document.defaultView;
    if (!window) return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      if (event.newValue === 'dark' || event.newValue === 'light') {
        html.classList.toggle('dark', event.newValue === 'dark');
      }
    };
    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
