import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ElementRef,
  Injector,
  type Signal,
  afterNextRender,
  effect,
  inject,
  untracked,
} from '@angular/core';

/** Los dos anuncios (en inglés, como los textos de los Blocks). */
export interface MimiBusyMessages {
  /** Al empezar a cargar. Por defecto, «Loading…». */
  start?: string;
  /** Al terminar. Por defecto, «Done.». */
  end?: string;
}

/**
 * Para un componente que se pone `inert` mientras carga (los Blocks): al empezar recuerda el
 * control de dentro que tenía el foco (el que lanzó la acción) y, al terminar, **cuando el
 * navegador ya lo vuelve a aceptar**, le devuelve el foco. Anuncia el comienzo y el final con
 * `LiveAnnouncer`, porque un contenido inerte no lo ven los lectores de pantalla. Si el foco no
 * estaba dentro, no lo toca. Se llama en un contexto de inyección, en el componente del anfitrión.
 */
export function restoreFocusAfterBusy(
  busy: Signal<boolean>,
  messages: MimiBusyMessages = {},
): void {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const announcer = inject(LiveAnnouncer);
  const injector = inject(Injector);
  let launcher: HTMLElement | null = null;
  let wasBusy = false;

  effect(() => {
    const isBusy = busy();
    untracked(() => {
      if (isBusy && !wasBusy) {
        const active = host.ownerDocument.activeElement;
        launcher = active instanceof HTMLElement && host.contains(active) ? active : null;
        void announcer.announce(messages.start ?? 'Loading…', 'polite');
      } else if (!isBusy && wasBusy) {
        void announcer.announce(messages.end ?? 'Done.', 'polite');
        const target = launcher;
        launcher = null;
        // Después del render que quita `inert`: antes, el navegador no deja enfocar nada.
        afterNextRender({ write: () => target?.isConnected && target.focus() }, { injector });
      }
      wasBusy = isBusy;
    });
  });
}
