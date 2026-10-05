import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiBadge } from './badge';
import type { BadgeTone, BadgeVariant, BadgeVariantShortcut } from './badge.variants';

@Component({
  imports: [MimiBadge],
  template: `
    <span mimiBadge [variant]="variant()" [tone]="tone()" [class]="extra()">
      <svg data-test="icon"></svg>
      Nuevo
    </span>
  `,
})
class Host {
  readonly variant = signal<BadgeVariant | BadgeVariantShortcut>('solid');
  readonly tone = signal<BadgeTone | undefined>(undefined);
  readonly extra = signal('');
}

describe('MimiBadge', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const badge = (fixture.nativeElement as HTMLElement).querySelector('span')!;
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    return { host: fixture.componentInstance, badge, update };
  }

  it('es el <span> nativo con las medidas del diseño', async () => {
    const { badge } = await setup();
    expect(badge.tagName).toBe('SPAN');
    expect(badge.dataset['variant']).toBe('solid');
    expect(badge.dataset['tone']).toBe('primary');
    for (const cls of [
      'inline-flex',
      'h-[22px]',
      'px-2.5',
      'rounded-badge',
      'text-xs',
      'font-semibold',
      'border',
    ]) {
      expect(badge.classList).toContain(cls);
    }
    // No se parte en dos líneas.
    expect(badge.classList).toContain('whitespace-nowrap');
    expect(badge.textContent?.trim()).toBe('Nuevo');
  });

  // Una clase representativa de cada variante con cada tono (badge.variants.ts, TONE_CLASSES).
  const EXPECTED: Record<BadgeVariant, Record<BadgeTone, string>> = {
    solid: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-success',
      warning: 'bg-warning',
      info: 'bg-info',
      danger: 'bg-destructive',
    },
    soft: {
      primary: 'bg-secondary',
      secondary: 'bg-muted',
      success: 'bg-success-soft',
      warning: 'bg-warning-soft',
      info: 'bg-info-soft',
      danger: 'bg-destructive-soft-bg',
    },
    outline: {
      primary: 'before:bg-primary',
      secondary: 'border-border',
      success: 'before:bg-success',
      warning: 'before:bg-warning',
      info: 'before:bg-info',
      danger: 'before:bg-destructive',
    },
  };
  const COMBOS = (Object.keys(EXPECTED) as BadgeVariant[]).flatMap((variant) =>
    (Object.keys(EXPECTED[variant]) as BadgeTone[]).map(
      (tone) => [variant, tone, EXPECTED[variant][tone]] as const,
    ),
  );

  it.each(COMBOS)('variante %s con tono %s', async (variant, tone, expected) => {
    const { host, badge, update } = await setup();
    await update(() => {
      host.variant.set(variant);
      host.tone.set(tone);
    });
    expect(badge.dataset['variant']).toBe(variant);
    expect(badge.dataset['tone']).toBe(tone);
    expect(badge.classList).toContain(expected);
  });

  it('outline sin tone es neutro y sin punto, como en la 0.1.0', async () => {
    const { host, badge, update } = await setup();
    await update(() => host.variant.set('outline'));
    expect(badge.dataset['tone']).toBe('secondary');
    for (const cls of ['bg-transparent', 'text-foreground', 'border-border']) {
      expect(badge.classList).toContain(cls);
    }
    expect([...badge.classList].some((c) => c.startsWith('before:'))).toBe(false);
  });

  it('el punto de outline con tono es decorativo: un ::before vacío, sin texto', async () => {
    const { host, badge, update } = await setup();
    await update(() => {
      host.variant.set('outline');
      host.tone.set('success');
    });
    expect(badge.classList).toContain("before:content-['']");
    expect(badge.classList).toContain('before:size-1.5');
    expect(badge.textContent?.trim()).toBe('Nuevo');
  });

  it.each<[BadgeVariantShortcut, BadgeTone, string]>([
    ['default', 'primary', 'bg-primary'],
    ['secondary', 'secondary', 'bg-secondary'],
    ['destructive', 'danger', 'bg-destructive'],
  ])('atajo de la 0.1.0: variant="%s" = solid + %s', async (shortcut, tone, cls) => {
    const { host, badge, update } = await setup();
    await update(() => host.variant.set(shortcut));
    expect(badge.dataset['variant']).toBe('solid');
    expect(badge.dataset['tone']).toBe(tone);
    expect(badge.classList).toContain(cls);
  });

  it('un atajo con tone: gana el atajo y avisa una sola vez en modo desarrollo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { host, badge, update } = await setup();
    await update(() => {
      host.variant.set('secondary');
      host.tone.set('warning');
    });
    expect(badge.dataset['tone']).toBe('secondary');
    await update(() => host.tone.set('info'));
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('la clase del usuario gana a los colores del tono', async () => {
    const { host, badge, update } = await setup();
    await update(() => {
      host.tone.set('warning');
      host.extra.set('bg-info');
    });
    expect(badge.classList).toContain('bg-info');
    expect(badge.classList).not.toContain('bg-warning');
  });

  it('los íconos van a 12px y no se deforman', async () => {
    const { badge } = await setup();
    expect(badge.classList).toContain('[&_svg]:size-3');
    expect(badge.classList).toContain('[&_svg]:shrink-0');
    expect(badge.classList).toContain('gap-1');
    expect(badge.querySelector('[data-test="icon"]')).not.toBeNull();
  });

  it('la clase del usuario gana', async () => {
    const { host, badge, update } = await setup();
    await update(() => host.extra.set('rounded-md bg-accent h-6'));
    expect(badge.classList).toContain('rounded-md');
    expect(badge.classList).toContain('bg-accent');
    expect(badge.classList).toContain('h-6');
    expect(badge.classList).not.toContain('rounded-badge');
    expect(badge.classList).not.toContain('bg-primary');
    expect(badge.classList).not.toContain('h-[22px]');
  });
});
