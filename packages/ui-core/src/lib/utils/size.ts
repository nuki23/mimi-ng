import {
  Directive,
  InjectionToken,
  type Signal,
  computed,
  forwardRef,
  inject,
  input,
  isDevMode,
} from '@angular/core';

/**
 * Tamaño de los componentes (R.1, spec 4): una sola escala `sm | md | lg` en toda la librería.
 * Las alturas de los controles salen de `--mimi-control-height-sm/-/lg`, así Button, Input,
 * Select… quedan alineados en el mismo tamaño.
 */
export type MimiSize = 'sm' | 'md' | 'lg';

/** Tamaños que acepta un componente: `default` es el nombre viejo de `md` (se quita en la 0.7.0). */
export type MimiSizeInput = MimiSize | 'default';

/** Lo que un contenedor con `mimiSize` le da a los controles de dentro. */
export interface MimiSizeContext {
  readonly size: Signal<MimiSize>;
}

export const MIMI_SIZE = new InjectionToken<MimiSizeContext>('MIMI_SIZE');

const warned = new Set<string>();

/** `default` → `md`, con un aviso en desarrollo (una vez por componente). */
export function normalizeMimiSize(
  value: MimiSizeInput | null | undefined,
  component: string,
): MimiSize | undefined {
  if (value === 'default') {
    if (isDevMode() && !warned.has(component)) {
      warned.add(component);
      console.warn(
        `[Mimi] Size: ${component} usa size="default", que se llama ahora "md"; "default" se quitará en la 0.7.0.`,
      );
    }
    return 'md';
  }
  return value ?? undefined;
}

/**
 * El tamaño de un control: el suyo (`size`), si no el del contenedor `mimiSize` más cercano, y si
 * no `md`. Se llama en un contexto de inyección (una propiedad del componente).
 *
 * ```ts
 * readonly size = input<MimiSizeInput>();
 * protected readonly resolvedSize = injectMimiSize(this.size, 'MimiInput');
 * ```
 */
export function injectMimiSize(
  own: Signal<MimiSizeInput | null | undefined>,
  component: string,
): Signal<MimiSize> {
  const scope = inject(MIMI_SIZE, { optional: true });
  return computed(() => normalizeMimiSize(own(), component) ?? scope?.size() ?? 'md');
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
  readonly mimiSize = input.required<MimiSizeInput>();
  readonly size = computed<MimiSize>(() => normalizeMimiSize(this.mimiSize(), 'mimiSize') ?? 'md');
}
