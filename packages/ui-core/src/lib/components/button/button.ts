import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { cn } from '@/components/ui/utils';
import { type ButtonSize, type ButtonVariant, buttonVariants } from './button.variants';

/**
 * Botón de Mimi sobre el elemento nativo: `<button mimiBtn>` o `<a mimiBtn>`.
 *
 * - `disabled` o `loading` deshabilitan: `disabled` nativo en <button>; en <a>,
 *   `aria-disabled="true"`, `tabindex="-1"` y el clic se cancela.
 * - `loading` muestra un spinner centrado encima del contenido, que queda transparente en su
 *   lugar: el botón no cambia de ancho y conserva su nombre accesible. Lleva `aria-busy="true"`.
 */
@Component({
  selector: 'button[mimiBtn], a[mimiBtn]',
  exportAs: 'mimiBtn',
  template: `
    @if (loading()) {
      <svg
        data-slot="spinner"
        class="absolute inset-0 m-auto animate-[mimi-spin_0.8s_linear_infinite]"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- Lucide loader-circle (ISC) -->
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    }
    <span data-slot="content" class="contents" [class.text-transparent]="loading()">
      <ng-content />
    </span>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.disabled]': 'isNativeButton && isDisabled() ? "" : null',
    '[attr.aria-disabled]': '!isNativeButton && isDisabled() ? "true" : null',
    '[attr.tabindex]': '!isNativeButton && isDisabled() ? "-1" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiButton {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isNativeButton = this.element.tagName === 'BUTTON';

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({ variant: this.variant(), size: this.size() }),
      // El diseño deshabilitado no tiene sombra; cargando la conserva.
      this.disabled() && !this.loading() && 'shadow-none',
      this.userClass(),
    ),
  );

  /**
   * En <a> deshabilitado cancela el clic (en <button> el navegador ya lo bloquea). Se escucha
   * en la fase de captura: en el propio elemento corre antes que los (click) del usuario, que
   * Angular registra primero, y así stopImmediatePropagation también los detiene.
   */
  private readonly blockDisabledClicks = (() => {
    const onClick = (event: Event) => {
      if (!this.isDisabled()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    this.element.addEventListener('click', onClick, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      this.element.removeEventListener('click', onClick, { capture: true }),
    );
  })();
}
