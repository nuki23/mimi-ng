import { Injectable, signal } from '@angular/core';

/** Estado del panel de navegación móvil, compartido entre el botón del header y el panel. */
@Injectable({ providedIn: 'root' })
export class MobileNavService {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((open) => !open);
  }
}
