import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '@/components/ui/utils/cn';

/**
 * Bloque de carga (docs/design/Mimi Componentes.dc.html, sección 9): fondo --mimi-muted que
 * late con `animate-mimi-pulse`. El tamaño y la forma se ponen con `class`:
 * `<mimi-skeleton class="h-3 w-2/3" />`, `<mimi-skeleton class="size-12 rounded-full" />`.
 *
 * Es `aria-hidden`: el contenedor que carga lleva `aria-busy="true"` y un texto para lectores
 * de pantalla. Con movimiento reducido queda quieto.
 */
@Component({
  selector: 'mimi-skeleton',
  template: '',
  host: {
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiSkeleton {
  readonly userClass = input('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'block rounded-[var(--mimi-skeleton-radius,var(--mimi-radius-sm))] bg-[color:var(--mimi-skeleton-bg,var(--mimi-muted))] animate-[mimi-pulse_var(--mimi-skeleton-duration,1.6s)_ease-in-out_infinite] motion-reduce:animate-none',
      this.userClass(),
    ),
  );
}
