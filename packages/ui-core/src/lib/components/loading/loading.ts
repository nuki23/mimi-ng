import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  type ComponentRef,
  DOCUMENT,
  DestroyRef,
  Injectable,
  InjectionToken,
  type Provider,
  inject,
} from '@angular/core';
import type { MimiSize } from '@/components/ui/utils/size';
import { MimiLoadingOverlay } from './loading-overlay';
import { MIMI_LOADING_TEXT, type MimiLoadingText } from './loading-texts';

/*
 * Carga de toda la vista (R.23): `MimiLoadingService.show()` pone una capa sobre la página, deja el
 * resto `inert` y con `aria-busy` y anuncia el mensaje. Con un contador: varias llamadas mantienen
 * la capa hasta el último `hide()`. `delay` (no parpadea si dura poco) y `minDuration` (no
 * desaparece de golpe). Decisión de la tarea: `inert` en vez de una trampa de foco (más simple y no
 * bloquea a los lectores); el foco vuelve a donde estaba.
 */

/** Opciones de una carga. */
export interface MimiLoadingOptions {
  /** Cuánto esperar antes de mostrar la capa (ms). Por defecto, 200. */
  delay?: number;
  /** Cuánto se queda como mínimo una vez visible (ms). Por defecto, 400. */
  minDuration?: number;
  /** El tamaño del anillo y del texto. */
  size?: MimiSize;
  /**
   * Los textos de esta carga (los pone `injectMimiLoading` con los del componente que la pide: el
   * servicio es de la raíz y no ve un `provideMimiLoadingText` de una página).
   */
  texts?: MimiLoadingText;
}

/** Lo que devuelve `show()`. */
export interface MimiLoadingRef {
  /** Termina esta carga (la capa se va cuando no queda ninguna). */
  hide(): void;
  /** Cambia el mensaje (si es la carga que se ve). */
  update(message: string): void;
}

/** Valores por defecto de toda la app: `provideMimiLoading({ delay: 300 })`. */
export const MIMI_LOADING_CONFIG = new InjectionToken<
  Required<Pick<MimiLoadingOptions, 'delay' | 'minDuration' | 'size'>>
>('MIMI_LOADING_CONFIG', {
  providedIn: 'root',
  factory: () => ({ delay: 200, minDuration: 400, size: 'md' }),
});

/** Cambia los valores por defecto de la carga. */
export function provideMimiLoading(
  config: Pick<MimiLoadingOptions, 'delay' | 'minDuration' | 'size'>,
): Provider {
  return {
    provide: MIMI_LOADING_CONFIG,
    useValue: { delay: 200, minDuration: 400, size: 'md', ...config },
  };
}

/**
 * @internal El reloj de una capa: cuántas cargas hay, cuándo mostrarla (tras `delay`) y cuándo
 * quitarla (no antes de `minDuration`). Lo usan el servicio y la directiva.
 */
export class MimiLoadingGate {
  private active = 0;
  private visible = false;
  private shownAt = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly onShow: () => void,
    private readonly onHide: () => void,
  ) {}

  get isVisible(): boolean {
    return this.visible;
  }

  /** Empieza una carga. */
  acquire(delay: number): void {
    this.active++;
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.visible || this.showTimer) return;
    const show = () => {
      this.showTimer = null;
      if (!this.active) return;
      this.visible = true;
      this.shownAt = Date.now();
      this.onShow();
    };
    if (delay <= 0) show();
    else this.showTimer = setTimeout(show, delay);
  }

  /** Termina una carga; con la última, la capa se va (respetando `minDuration`). */
  release(minDuration: number): void {
    if (!this.active) return;
    this.active--;
    if (this.active) return;
    if (this.showTimer) {
      // Terminó antes de que hiciera falta mostrarla: no aparece.
      clearTimeout(this.showTimer);
      this.showTimer = null;
      return;
    }
    if (!this.visible) return;
    const wait = Math.max(0, this.shownAt + minDuration - Date.now());
    const hide = () => {
      this.hideTimer = null;
      if (this.active) return;
      this.visible = false;
      this.onHide();
    };
    if (wait <= 0) hide();
    else this.hideTimer = setTimeout(hide, wait);
  }

  /** Termina todas. */
  releaseAll(minDuration: number): void {
    if (!this.active) return;
    this.active = 1;
    this.release(minDuration);
  }

  /** Sin esperas: lo quita ya (al destruir). */
  destroy(): void {
    if (this.showTimer) clearTimeout(this.showTimer);
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.showTimer = this.hideTimer = null;
    this.active = 0;
    if (this.visible) {
      this.visible = false;
      this.onHide();
    }
  }
}

/** @internal Pone `inert` y `aria-busy` en unos elementos y luego devuelve lo que tenían. */
export function mimiMakeInert(elements: Iterable<Element>): () => void {
  const saved: [Element, string | null, string | null][] = [];
  for (const el of elements) {
    saved.push([el, el.getAttribute('inert'), el.getAttribute('aria-busy')]);
    el.setAttribute('inert', '');
    el.setAttribute('aria-busy', 'true');
  }
  return () => {
    for (const [el, inert, busy] of saved) {
      if (inert === null) el.removeAttribute('inert');
      else el.setAttribute('inert', inert);
      if (busy === null) el.removeAttribute('aria-busy');
      else el.setAttribute('aria-busy', busy);
    }
  };
}

/**
 * Carga de toda la vista:
 *
 * ```ts
 * private readonly loading = inject(MimiLoadingService);
 * const ref = this.loading.show('Saving…');
 * await save();
 * ref.hide();
 * ```
 *
 * Para que se limpie sola si el componente se destruye, `injectMimiLoading()`.
 */
@Injectable({ providedIn: 'root' })
export class MimiLoadingService {
  private readonly overlay = inject(Overlay);
  private readonly document = inject(DOCUMENT);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly texts = inject(MIMI_LOADING_TEXT);
  private readonly config = inject(MIMI_LOADING_CONFIG);

  private overlayRef: OverlayRef | null = null;
  private component: ComponentRef<MimiLoadingOverlay> | null = null;
  private restoreInert: (() => void) | null = null;
  private focusBack: HTMLElement | null = null;
  /** Las cargas abiertas, en orden: la última da el mensaje. */
  private readonly stack: { message: string; size: MimiSize; texts: MimiLoadingText }[] = [];
  /** Los textos de la última carga que terminó (para «Done.»). */
  private lastTexts: MimiLoadingText = this.texts;
  private minDuration = this.config.minDuration;

  private readonly gate = new MimiLoadingGate(
    () => this.attach(),
    () => this.detach(),
  );

  /** Si la capa se ve ahora. */
  get visible(): boolean {
    return this.gate.isVisible;
  }

  /** Empieza una carga de toda la vista. */
  show(message?: string, options: MimiLoadingOptions = {}): MimiLoadingRef {
    const texts = options.texts ?? this.texts;
    const entry = {
      message: message || texts.loading,
      size: options.size ?? this.config.size,
      texts,
    };
    this.stack.push(entry);
    this.minDuration = options.minDuration ?? this.config.minDuration;
    this.gate.acquire(options.delay ?? this.config.delay);
    this.render();
    let done = false;
    return {
      hide: () => {
        if (done) return;
        done = true;
        const at = this.stack.indexOf(entry);
        if (at >= 0) this.stack.splice(at, 1);
        this.lastTexts = entry.texts;
        this.render();
        this.gate.release(this.minDuration);
      },
      update: (text: string) => {
        entry.message = text || entry.texts.loading;
        this.render();
      },
    };
  }

  /** Termina todas las cargas. */
  hideAll(): void {
    this.stack.length = 0;
    this.gate.releaseAll(this.minDuration);
  }

  private current() {
    return this.stack.at(-1);
  }

  private render(): void {
    const top = this.current();
    if (!this.component || !top) return;
    this.component.setInput('message', top.message);
    this.component.setInput('size', top.size);
    this.component.changeDetectorRef.detectChanges();
    // Con la capa a la vista, un mensaje nuevo (update o la carga de encima terminó) se anuncia.
    if (top.message !== this.announced) this.announceCurrent();
  }

  /** El último mensaje anunciado (para no repetirlo en cada pintada). */
  private announced: string | null = null;

  private announceCurrent(): void {
    const message = this.current()?.message ?? this.texts.loading;
    this.announced = message;
    void this.announcer.announce(message, 'polite');
  }

  private attach(): void {
    const doc = this.document;
    const active = doc.activeElement;
    this.focusBack = active instanceof HTMLElement && active !== doc.body ? active : null;
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global(),
      width: '100%',
      height: '100%',
    });
    this.component = this.overlayRef.attach(new ComponentPortal(MimiLoadingOverlay));
    const container = this.overlayRef.hostElement.parentElement;
    // Fuera quedan la capa, los scripts y las regiones vivas (la de LiveAnnouncer y cualquier
    // `aria-live` suelto en el body): inertes, el lector no oiría el mensaje (revisión de la tanda 3).
    this.restoreInert = mimiMakeInert(
      [...doc.body.children].filter(
        (el) =>
          el !== container &&
          el.tagName !== 'SCRIPT' &&
          !el.classList.contains('cdk-live-announcer-element') &&
          !el.hasAttribute('aria-live'),
      ),
    );
    // Pinta y anuncia el mensaje (una vez: `render` anuncia si no se había anunciado).
    this.render();
  }

  private detach(): void {
    this.restoreInert?.();
    this.restoreInert = null;
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.component = null;
    this.announced = null;
    void this.announcer.announce(this.lastTexts.done, 'polite');
    const target = this.focusBack;
    this.focusBack = null;
    const doc = target?.ownerDocument;
    if (target?.isConnected && (!doc?.activeElement || doc.activeElement === doc.body)) {
      target.focus();
    }
  }
}

/**
 * La carga de toda la vista ligada al componente que la pide: si el componente se destruye con
 * cargas abiertas, se terminan (la capa no se queda colgada). Se llama en un contexto de inyección.
 *
 * ```ts
 * private readonly loading = injectMimiLoading();
 * // …
 * const ref = this.loading.show();
 * ```
 */
export function injectMimiLoading(): Pick<MimiLoadingService, 'show'> {
  const service = inject(MimiLoadingService);
  // Los textos del componente que la pide (su `provideMimiLoadingText` o el de la app).
  const texts = inject(MIMI_LOADING_TEXT);
  const open = new Set<MimiLoadingRef>();
  inject(DestroyRef).onDestroy(() => {
    for (const ref of open) ref.hide();
    open.clear();
  });
  return {
    show(message?: string, options?: MimiLoadingOptions): MimiLoadingRef {
      const ref = service.show(message, { texts, ...options });
      open.add(ref);
      return {
        hide: () => {
          open.delete(ref);
          ref.hide();
        },
        update: (text) => ref.update(text),
      };
    },
  };
}
