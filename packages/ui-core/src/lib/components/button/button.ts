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
import { type MimiSizeInput, injectMimiSize, normalizeMimiSize } from '@/components/ui/utils/size';
import {
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
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
 * - `disabled` deshabilita: `disabled` nativo en <button>; en <a>, `aria-disabled="true"`,
 *   `tabindex="-1"` y el clic se cancela.
 * - `loading` muestra un spinner centrado encima del contenido, que queda transparente en su
 *   lugar: el botón no cambia de ancho y conserva su nombre accesible. Lleva `aria-busy="true"`.
 *   En <button> **sigue enfocable** (R.33): `aria-disabled="true"` en vez del `disabled` nativo, y
 *   Button cancela el clic, Enter, Espacio y el envío implícito del formulario (Enter en un campo).
 *   Así el foco no cae a <body> al empezar ni al terminar de cargar. En <a>, como `disabled`.
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
    // Solo el `size` propio (y `icon`): sin él, el `md` del tema o el del contenedor `[data-size]`.
    '[attr.data-size]': 'ownSize()',
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.data-disabled]': 'isDisabled() ? "" : null',
    // Solo `disabled`: cargando, el <button> sigue enfocable (aria-disabled, R.33).
    '[attr.disabled]': 'isNativeButton && disabled() ? "" : null',
    // aria-disabled, tabindex y aria-busy no van aquí: un binding de host que vale null borra el
    // atributo que haya puesto el usuario. Los pone `ownAttributes` solo cuando hacen falta.
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiButton {
  /** Incluye los atajos de la 0.1.x (`ButtonVariantShortcut`, deprecados). */
  readonly variant = input<ButtonVariant>('solid');
  readonly tone = input<ButtonTone>();
  /**
   * `sm | md | lg | icon`. Sin `size`, el del contenedor `mimiSize` o `md`. `default` es el nombre
   * viejo de `md` (se quita en la 0.7.0).
   */
  readonly size = input<ButtonSize | 'default'>();
  /** El tamaño de verdad: el propio, el del contenedor o `md` (`icon` no se hereda). */
  protected readonly sizeResolved = (() => {
    const inherited = injectMimiSize(
      computed(() => (this.size() === 'icon' ? undefined : (this.size() as MimiSizeInput))),
      'MimiButton',
    );
    return computed<ButtonSize>(() => (this.size() === 'icon' ? 'icon' : inherited()));
  })();
  protected readonly ownSize = computed<ButtonSize | null>(() =>
    this.size() === 'icon'
      ? 'icon'
      : (normalizeMimiSize(this.size() as MimiSizeInput, 'MimiButton') ?? null),
  );
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
        `[Mimi] Button: variant="${this.variant()}" ya define el color; se ignora ` +
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
        size: this.sizeResolved(),
      }),
      // El diseño deshabilitado no tiene sombra; cargando la conserva.
      this.disabled() && !this.loading() && 'shadow-none',
      this.userClass(),
    ),
  );

  /**
   * `aria-disabled="true"` y `tabindex="-1"` en un <a> deshabilitado o cargando, `aria-disabled` en
   * un <button> que carga (sin `disabled`: sigue en el orden de tabulación) y `aria-busy="true"`
   * mientras carga. Solo se escriben cuando hacen falta; al dejar de hacer falta vuelve el valor que tenía el
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
      const loadingButton = this.isNativeButton && this.loading() && !this.disabled();
      apply('aria-disabled', disabledLink || loadingButton ? 'true' : null);
      apply('tabindex', disabledLink ? '-1' : null);
      apply('aria-busy', this.loading() ? 'true' : null);
    });
  })();

  /**
   * Cancela el clic en <a> deshabilitado y en <button> que carga (con `disabled` nativo, el
   * navegador ya lo bloquea). Se escucha en la fase de captura: en el propio elemento corre antes
   * que los (click) del usuario, que Angular registra primero, y así stopImmediatePropagation
   * también los detiene. Enter y Espacio en el botón, y Enter en un campo del formulario (el envío
   * implícito), llegan como un `click` en el botón: `preventDefault` cancela también el envío.
   * `loading` es una entrada: cambia cuando Angular pinta, así que un segundo clic en el mismo
   * instante que el primero no se bloquea aquí (M.1).
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
