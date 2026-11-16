import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  type ComponentRef,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  numberAttribute,
  untracked,
} from '@angular/core';
import type { MimiSize } from '@/components/ui/utils/size';
import { MIMI_LOADING_CONFIG, MimiLoadingGate, mimiMakeInert } from './loading';
import { MimiLoadingOverlay } from './loading-overlay';
import { MIMI_LOADING_TEXT } from './loading-texts';

/**
 * La carga de un contenedor (R.23): `<section [mimiBlock]="saving()" mimiBlockMessage="Saving…">`.
 * La capa cubre solo ese elemento (si su posición es `static`, la directiva le pone `relative`), lo
 * de dentro queda `inert` y el contenedor con `aria-busy`; se anuncia al empezar y al terminar, y
 * el foco vuelve al control de dentro que lo tenía. Las mismas esperas que el servicio.
 */
@Directive({ selector: '[mimiBlock]', exportAs: 'mimiBlock' })
export class MimiBlock {
  readonly active = input(false, { alias: 'mimiBlock', transform: booleanAttribute });
  readonly message = input('', { alias: 'mimiBlockMessage' });
  readonly delay = input<number | undefined, unknown>(undefined, {
    alias: 'mimiBlockDelay',
    transform: (v: unknown) =>
      v === undefined || v === null || v === '' ? undefined : numberAttribute(v),
  });
  readonly minDuration = input<number | undefined, unknown>(undefined, {
    alias: 'mimiBlockMinDuration',
    transform: (v: unknown) =>
      v === undefined || v === null || v === '' ? undefined : numberAttribute(v),
  });
  readonly size = input<MimiSize | undefined>(undefined, { alias: 'mimiBlockSize' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly texts = inject(MIMI_LOADING_TEXT);
  private readonly config = inject(MIMI_LOADING_CONFIG);

  private overlay: ComponentRef<MimiLoadingOverlay> | null = null;
  private restore: (() => void) | null = null;
  private launcher: HTMLElement | null = null;
  private positioned = false;

  private readonly gate = new MimiLoadingGate(
    () => this.show(),
    () => this.hide(),
  );

  private readonly sync = effect(() => {
    const active = this.active();
    untracked(() => {
      if (active) this.gate.acquire(this.delay() ?? this.config.delay);
      else this.gate.release(this.minDuration() ?? this.config.minDuration);
    });
  });

  private readonly refresh = effect(() => {
    const message = this.message() || this.texts.loading;
    const size = this.size() ?? this.config.size;
    untracked(() => {
      this.overlay?.setInput('message', message);
      this.overlay?.setInput('size', size);
    });
  });

  private destroyed = false;
  private readonly cleanup = inject(DestroyRef).onDestroy(() => {
    this.destroyed = true;
    this.gate.destroy();
  });

  private show(): void {
    const doc = this.host.ownerDocument;
    const active = doc.activeElement;
    this.launcher = active instanceof HTMLElement && this.host.contains(active) ? active : null;
    const position = doc.defaultView?.getComputedStyle(this.host).position;
    if (!position || position === 'static') {
      this.host.style.position = 'relative';
      this.positioned = true;
    }
    this.restore = mimiMakeInert([...this.host.children]);
    // aria-busy en el contenedor (sin inert: la capa vive dentro).
    const busyBefore = this.host.getAttribute('aria-busy');
    this.host.setAttribute('aria-busy', 'true');
    const restoreChildren = this.restore;
    this.restore = () => {
      restoreChildren();
      if (busyBefore === null) this.host.removeAttribute('aria-busy');
      else this.host.setAttribute('aria-busy', busyBefore);
    };
    this.overlay = this.vcr.createComponent(MimiLoadingOverlay);
    this.overlay.setInput('cover', 'absolute');
    this.overlay.setInput('message', this.message() || this.texts.loading);
    this.overlay.setInput('size', this.size() ?? this.config.size);
    this.host.appendChild(this.overlay.location.nativeElement);
    void this.announcer.announce(this.message() || this.texts.loading, 'polite');
  }

  private hide(): void {
    this.restore?.();
    this.restore = null;
    this.overlay?.destroy();
    this.overlay = null;
    if (this.positioned) {
      this.host.style.position = '';
      this.positioned = false;
    }
    const target = this.launcher;
    this.launcher = null;
    // Al destruirse el contenedor, ni anuncio ni foco: ya no está.
    if (this.destroyed) return;
    void this.announcer.announce(this.texts.done, 'polite');
    // Después del render que quita `inert`: antes, el navegador no deja enfocar.
    afterNextRender(
      { write: () => target?.isConnected && target.focus() },
      { injector: this.injector },
    );
  }
}
