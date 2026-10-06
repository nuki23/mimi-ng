import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiButton } from './button';
import type {
  ButtonSize,
  ButtonTone,
  ButtonVariant,
  ButtonVariantShortcut,
} from './button.variants';

@Component({
  imports: [MimiButton],
  template: `
    <button
      mimiBtn
      [variant]="variant()"
      [tone]="tone()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      [class]="extra()"
      (click)="clicks.set(clicks() + 1)"
    >
      <svg data-test="icon"></svg>
      Guardar
    </button>
    <a
      mimiBtn
      href="/destino"
      [disabled]="disabled()"
      [loading]="loading()"
      (click)="linkClicks.set(linkClicks() + 1)"
      >Ir</a
    >
  `,
})
class Host {
  readonly variant = signal<ButtonVariant | ButtonVariantShortcut>('solid');
  readonly tone = signal<ButtonTone | undefined>(undefined);
  readonly size = signal<ButtonSize>('default');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly extra = signal('');
  readonly clicks = signal(0);
  readonly linkClicks = signal(0);
}

describe('MimiButton', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const host = fixture.componentInstance;
    const button = el.querySelector('button')!;
    const link = el.querySelector('a')!;
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    return { host, button, link, update };
  }

  it('es el elemento nativo, con variante y tamaño por defecto', async () => {
    const { button } = await setup();
    expect(button.tagName).toBe('BUTTON');
    expect(button.dataset['variant']).toBe('solid');
    expect(button.dataset['tone']).toBe('primary');
    expect(button.dataset['size']).toBe('default');
    expect(button.classList).toContain('bg-primary');
    expect(button.classList).toContain('shadow-primary');
    expect(button.classList).toContain(
      'h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]',
    );
    expect(button.classList).toContain('focus-visible:outline-ring');
    expect(button.classList).toContain(
      'active:scale-[var(--mimi-btn-press-scale,var(--mimi-press-scale))]',
    );
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });

  // Una clase representativa de cada variante con cada tono (button.variants.ts, TONE_CLASSES).
  const EXPECTED: Record<ButtonVariant, Record<ButtonTone, string>> = {
    solid: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-success',
      warning: 'bg-warning',
      info: 'bg-info',
      danger: 'bg-destructive',
    },
    soft: {
      primary: 'hover:not-disabled:bg-primary-soft-hover',
      secondary: 'bg-muted',
      success: 'bg-success-soft',
      warning: 'bg-warning-soft',
      info: 'bg-info-soft',
      danger: 'bg-destructive-soft-bg',
    },
    outline: {
      primary: 'border-primary-border',
      secondary: 'border-border',
      success: 'border-success-border',
      warning: 'border-warning-border',
      info: 'border-info-border',
      danger: 'border-destructive-border',
    },
    ghost: {
      primary: 'hover:not-disabled:bg-accent',
      secondary: 'hover:not-disabled:bg-accent',
      success: 'hover:not-disabled:bg-success-soft',
      warning: 'hover:not-disabled:bg-warning-soft',
      info: 'hover:not-disabled:bg-info-soft',
      danger: 'hover:not-disabled:bg-destructive-soft-bg',
    },
    link: {
      primary: 'text-primary',
      secondary: 'text-foreground',
      success: 'text-success-soft-foreground',
      warning: 'text-warning-soft-foreground',
      info: 'text-info-soft-foreground',
      danger: 'text-destructive-soft-foreground',
    },
  };
  const COMBOS = (Object.keys(EXPECTED) as ButtonVariant[]).flatMap((variant) =>
    (Object.keys(EXPECTED[variant]) as ButtonTone[]).map(
      (tone) => [variant, tone, EXPECTED[variant][tone]] as const,
    ),
  );

  it.each(COMBOS)('variante %s con tono %s', async (variant, tone, expected) => {
    const { host, button, update } = await setup();
    await update(() => {
      host.variant.set(variant);
      host.tone.set(tone);
    });
    expect(button.dataset['variant']).toBe(variant);
    expect(button.dataset['tone']).toBe(tone);
    expect(button.classList).toContain(expected);
  });

  it.each<[ButtonVariant, ButtonTone]>([
    ['solid', 'primary'],
    ['soft', 'primary'],
    ['outline', 'secondary'],
    ['ghost', 'secondary'],
    ['link', 'primary'],
  ])('sin tone, %s usa su tono natural (%s)', async (variant, tone) => {
    const { host, button, update } = await setup();
    await update(() => host.variant.set(variant));
    expect(button.dataset['tone']).toBe(tone);
  });

  it('outline y ghost sin tone se ven como en la 0.1.0', async () => {
    const { host, button, update } = await setup();
    await update(() => host.variant.set('outline'));
    for (const cls of [
      'border-border',
      'bg-card',
      'text-foreground',
      'shadow-neutral',
      'hover:not-disabled:bg-accent',
      'hover:not-disabled:shadow-neutral-hover',
      'active:ring-ring-soft',
    ]) {
      expect(button.classList).toContain(cls);
    }
    await update(() => host.variant.set('ghost'));
    for (const cls of ['bg-transparent', 'text-foreground', 'hover:not-disabled:bg-accent']) {
      expect(button.classList).toContain(cls);
    }
  });

  it.each<[ButtonVariantShortcut, ButtonTone, string[]]>([
    ['default', 'primary', ['bg-primary', 'shadow-primary', 'active:ring-ring-soft']],
    ['secondary', 'secondary', ['bg-secondary', 'shadow-neutral']],
    [
      'destructive',
      'danger',
      ['bg-destructive', 'shadow-destructive', 'active:ring-destructive-ring'],
    ],
  ])('atajo de la 0.1.0: variant="%s" = solid + %s', async (shortcut, tone, classes) => {
    const { host, button, update } = await setup();
    await update(() => host.variant.set(shortcut));
    expect(button.dataset['variant']).toBe('solid');
    expect(button.dataset['tone']).toBe(tone);
    for (const cls of classes) expect(button.classList).toContain(cls);
  });

  it('un atajo con tone: gana el atajo y avisa una sola vez en modo desarrollo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { host, button, update } = await setup();
    await update(() => {
      host.variant.set('destructive');
      host.tone.set('success');
    });
    expect(button.dataset['tone']).toBe('danger');
    expect(button.classList).toContain('bg-destructive');
    expect(button.classList).not.toContain('bg-success');
    await update(() => host.tone.set('info'));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('variant="destructive"');
    warn.mockRestore();
  });

  it('la clase del usuario gana también a los colores del tono', async () => {
    const { host, button, update } = await setup();
    await update(() => {
      host.tone.set('success');
      host.extra.set('bg-info');
    });
    expect(button.classList).toContain('bg-info');
    expect(button.classList).not.toContain('bg-success');
  });

  it('el enlace usa el padding del diseño (4px)', async () => {
    const { host, button, update } = await setup();
    await update(() => host.variant.set('link'));
    expect(button.classList).toContain('px-1');
    expect(button.classList).not.toContain(
      'px-[var(--mimi-btn-px,var(--mimi-btn-padding-x,1rem))]',
    );
  });

  it.each<[ButtonSize, string]>([
    ['sm', 'h-[var(--mimi-btn-height-sm,var(--mimi-control-height-sm,2rem))]'],
    ['default', 'h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]'],
    ['lg', 'h-[var(--mimi-btn-height-lg,var(--mimi-control-height-lg,3rem))]'],
    ['icon', 'size-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]'],
  ])('tamaño %s con la cascada de alturas', async (size, expected) => {
    const { host, button, update } = await setup();
    await update(() => host.size.set(size));
    expect(button.dataset['size']).toBe(size);
    expect(button.classList).toContain(expected);
  });

  it('la clase del usuario gana a la del componente', async () => {
    const { host, button, update } = await setup();
    await update(() => host.extra.set('h-12 bg-secondary w-full'));
    expect(button.classList).toContain('h-12');
    expect(button.classList).toContain('bg-secondary');
    expect(button.classList).toContain('w-full');
    expect(button.classList).not.toContain('bg-primary');
    expect(button.classList).not.toContain(
      'h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]',
    );
  });

  it('los valores tipados (length, weight) ceden ante la clase del usuario', async () => {
    const { host, button, update } = await setup();
    await update(() => host.extra.set('border-2 font-bold text-base focus-visible:outline-4'));
    for (const cls of ['border-2', 'font-bold', 'text-base', 'focus-visible:outline-4']) {
      expect(button.classList).toContain(cls);
    }
    for (const cls of [
      'border-[length:var(--mimi-btn-border-width,1px)]',
      'font-[weight:var(--mimi-btn-font-weight,500)]',
      'text-[length:var(--mimi-btn-font-size,0.875rem)]',
      'focus-visible:outline-[length:var(--mimi-btn-focus-ring-width,2px)]',
    ]) {
      expect(button.classList).not.toContain(cls);
    }
    // Un color de contorno del usuario no borra el grosor (sin el tipo, sí lo borraría).
    await update(() => host.extra.set('focus-visible:outline-ring'));
    expect(button.classList).toContain(
      'focus-visible:outline-[length:var(--mimi-btn-focus-ring-width,2px)]',
    );
  });

  it('deshabilitado: disabled nativo en <button>, sin sombra y sin clics', async () => {
    const { host, button, update } = await setup();
    await update(() => host.disabled.set(true));
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.hasAttribute('data-disabled')).toBe(true);
    expect(button.hasAttribute('aria-disabled')).toBe(false);
    expect(button.classList).toContain('shadow-none');
    button.click();
    expect(host.clicks()).toBe(0);
  });

  it('deshabilitado en <a>: aria-disabled, tabindex -1 y no navega', async () => {
    const { host, link, update } = await setup();
    expect(link.hasAttribute('aria-disabled')).toBe(false);
    expect(link.hasAttribute('tabindex')).toBe(false);

    await update(() => host.disabled.set(true));
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.hasAttribute('disabled')).toBe(false);
    expect(link.classList).toContain('aria-disabled:pointer-events-none');

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(host.linkClicks()).toBe(0);
  });

  it('cargando: deshabilitado, aria-busy y spinner', async () => {
    const { host, button, link, update } = await setup();
    await update(() => host.loading.set(true));

    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('data-loading')).toBe(true);
    // Conserva la sombra: el diseño de "cargando" la mantiene.
    expect(button.classList).not.toContain('shadow-none');
    expect(button.querySelector('[data-slot="spinner"]')?.getAttribute('aria-hidden')).toBe('true');
    button.click();
    expect(host.clicks()).toBe(0);

    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('aria-busy')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
  });

  it('cargando no cambia el ancho: el spinner va encima y el contenido sigue en su lugar', async () => {
    const { host, button, update } = await setup();
    const content = button.querySelector('[data-slot="content"]')!;
    expect(button.querySelector('[data-slot="spinner"]')).toBeNull();
    expect(content.classList).not.toContain('text-transparent');

    await update(() => host.loading.set(true));
    const spinner = button.querySelector('[data-slot="spinner"]')!;
    // Fuera del flujo (absolute), así no ocupa espacio en la fila del botón.
    expect(spinner.classList).toContain('absolute');
    expect(spinner.classList).toContain('inset-0');
    expect(button.classList).toContain('relative');
    // El contenido sigue ahí (mismo ancho) y conserva el nombre accesible.
    expect(content.classList).toContain('text-transparent');
    expect(content.textContent).toContain('Guardar');
    expect(content.querySelector('[data-test="icon"]')).not.toBeNull();
    expect(button.textContent).toContain('Guardar');

    await update(() => host.loading.set(false));
    expect(button.querySelector('[data-slot="spinner"]')).toBeNull();
    expect(content.classList).not.toContain('text-transparent');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });

  it('habilitado responde al clic y al teclado como un botón nativo', async () => {
    const { host, button } = await setup();
    button.click();
    expect(host.clicks()).toBe(1);
    // Es un <button> nativo: Enter y Espacio los resuelve el navegador; basta con que
    // siga siendo enfocable y sin tabindex propio.
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute('tabindex')).toBe(false);
  });

  it('los íconos del usuario se dimensionan solos', async () => {
    const { button } = await setup();
    expect(button.classList).toContain('[&_svg]:size-4');
    expect(button.classList).toContain('[&_svg]:shrink-0');
    expect(button.querySelector('[data-test="icon"]')).not.toBeNull();
  });
});
