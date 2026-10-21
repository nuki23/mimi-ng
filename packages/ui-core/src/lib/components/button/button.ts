import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import {
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
  type ButtonVariantShortcut,
  buttonVariants,
  resolveButtonStyle,
} from './button.variants';

/** El aviso de atajo + tone sale una sola vez por página. */
let warnedShortcutWithTone = false;

/**
 * Botón de Mimi sobre el elemento nativo: `<button mimiBtn>` o `<a mimiBtn>`.
 *
 * - `variant` (cómo se ve: solid, soft, outline, ghost, link) y `tone` (de qué color: primary,
 *   secondary, success, warning, info, danger). Sin `tone`, cada variante usa su tono natural:
 *   outline y ghost son neutros (secondary); las demás, primary. `data-variant` y `data-tone`
 *   muestran los valores resueltos.
 * - Los atajos de la 0.1.0 (`default`, `secondary`, `destructive`) siguen funcionando y ganan
 *   sobre `tone` (en modo desarrollo, avisa una vez).
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
    '[attr.data-variant]': 'resolved().variant',
    '[attr.data-tone]': 'resolved().tone',
    '[attr.data-size]': 'size()',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    '[attr.disabled]': 'isNativeButton && isDisabled() ? "" : null',
    // aria-disabled, tabindex y aria-busy no van aquí: un binding de host que vale null borra el
    // atributo que haya puesto el usuario. Los pone `ownAttributes` solo cuando hacen falta.
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiButton {
  readonly variant = input<ButtonVariant | ButtonVariantShortcut>('solid');
  readonly tone = input<ButtonTone>();
  readonly size = input<ButtonSize>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isNativeButton = this.element.tagName === 'BUTTON';

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly resolved = computed(() => {
    const style = resolveButtonStyle(this.variant(), this.tone());
    if (style.ignoredTone && isDevMode() && !warnedShortcutWithTone) {
      warnedShortcutWithTone = true;
      console.warn(
        `[mimi] mimiBtn: variant="${this.variant()}" ya define el color; se ignora ` +
          `tone="${this.tone()}". Usa variant="${style.variant}" con tone (los atajos se ` +
          `quitan en la 1.0).`,
      );
    }
    return style;
  });

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({
        variant: this.resolved().variant,
        tone: this.resolved().tone,
        size: this.size(),
      }),
      // El diseño deshabilitado no tiene sombra; cargando la conserva.
      this.disabled() && !this.loading() && 'shadow-none',
      this.userClass(),
    ),
  );

  /**
   * `aria-disabled="true"` y `tabindex="-1"` en un <a> deshabilitado, y `aria-busy="true"` mientras
   * carga. Solo se escriben cuando hacen falta; al dejar de hacer falta vuelve el valor que tenía el
   * elemento (el del usuario, fijo o enlazado) o se quitan. Así `<button mimiBtn aria-disabled="true">`
   * (un botón deshabilitado que sigue enfocable) conserva su atributo.
   */
  private readonly ownAttributes = (() => {
    const renderer = inject(Renderer2);
    /** Lo que había antes de que Mimi escribiera cada atributo (null: no había). */
    const previous = new Map<string, string | null>();
    const apply = (name: string, value: string | null) => {
      if (value !== null) {
        if (!previous.has(name)) previous.set(name, this.element.getAttribute(name));
        renderer.setAttribute(this.element, name, value);
        return;
      }
      if (!previous.has(name)) return;
      const before = previous.get(name) ?? null;
      previous.delete(name);
      if (before === null) renderer.removeAttribute(this.element, name);
      else renderer.setAttribute(this.element, name, before);
    };
    return effect(() => {
      const disabledLink = !this.isNativeButton && this.isDisabled();
      apply('aria-disabled', disabledLink ? 'true' : null);
      apply('tabindex', disabledLink ? '-1' : null);
      apply('aria-busy', this.loading() ? 'true' : null);
    });
  })();

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
