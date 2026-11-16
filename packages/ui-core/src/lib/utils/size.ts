import {
  Directive,
  ElementRef,
  InjectionToken,
  type Signal,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';

/**
 * Tamaño de los componentes (R.1, spec 4): una sola escala `sm | md | lg` en toda la librería.
 * Las alturas de los controles salen de `--mimi-control-height-sm/-/lg`, así Button, Input,
 * Select… quedan alineados en el mismo tamaño. (`default`, el nombre viejo de `md`, se quitó en la
 * 0.7.0: R.32.)
 */
export type MimiSize = 'sm' | 'md' | 'lg';

/** Lo que un contenedor con `mimiSize` le da a los controles de dentro. */
export interface MimiSizeContext {
  readonly size: Signal<MimiSize>;
}

export const MIMI_SIZE = new InjectionToken<MimiSizeContext>('MIMI_SIZE');

/**
 * El tamaño de un control: el suyo (`size`), si no el del contenedor `mimiSize` más cercano, y si
 * no `md`. Se llama en un contexto de inyección (una propiedad del componente).
 *
 * ```ts
 * readonly size = input<MimiSize>();
 * protected readonly resolvedSize = injectMimiSize(this.size);
 * ```
 */
export function injectMimiSize(own: Signal<MimiSize | null | undefined>): Signal<MimiSize> {
  const scope = inject(MIMI_SIZE, { optional: true });
  return computed(() => own() ?? scope?.size() ?? 'md');
}

/**
 * El `size` de un control, como directiva de anfitrión (R.2, R.8): el componente la declara con
 * `hostDirectives: [{ directive: MimiSized, inputs: ['size'] }]` y recibe `size` (`sm | md | lg`),
 * el `data-size` que activa la escala del tema y la herencia de `mimiSize`. Sin código propio.
 */
@Directive({ host: { '[attr.data-size]': 'own()' } })
export class MimiSized {
  readonly size = input<MimiSize>();
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly scope = inject(MIMI_SIZE, { optional: true });
  /**
   * Solo el `size` propio se escribe en `data-size`. Sin él no hay atributo: el `md` vive en el
   * tema (`:root`) y el control hereda, por la cascada de CSS, el `[data-size]` más cercano (un
   * `mimiSize` o cualquier contenedor que lo lleve).
   */
  protected readonly own = computed(() => this.size() ?? null);
  /** El tamaño de verdad (el propio, el del contenedor `mimiSize` o `md`). */
  readonly resolved = injectMimiSize(this.size);

  /**
   * Como `resolved`, pero mirando también el `[data-size]` más cercano en el DOM. Para lo que se
   * pinta en un overlay (fuera del anfitrión, la cascada no llega): se llama al pintar.
   */
  effective(): MimiSize {
    const own = this.own();
    if (own) return own;
    const scoped = this.scope?.size();
    if (scoped) return scoped;
    const near = this.element.parentElement?.closest<HTMLElement>('[data-size]')?.dataset['size'];
    return near === 'sm' || near === 'lg' || near === 'md' ? near : 'md';
  }
}

/**
 * Da un tamaño a todos los controles de un contenedor, en vez de escribirlo en cada uno:
 * `<form mimiSize="sm">…</form>`. El `size` propio de un control gana.
 */
@Directive({
  selector: '[mimiSize]',
  providers: [{ provide: MIMI_SIZE, useExisting: forwardRef(() => MimiSizeScope) }],
  // `data-size` en el contenedor: la escala del tema (`[data-size]`) llega por la cascada de CSS
  // también a los componentes que no tienen `size` propio.
  host: { '[attr.data-size]': 'size()' },
})
export class MimiSizeScope implements MimiSizeContext {
  readonly mimiSize = input.required<MimiSize>();
  readonly size = computed<MimiSize>(() => this.mimiSize() ?? 'md');
}
