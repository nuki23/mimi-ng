import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiBadge } from './badge';
import type { BadgeVariant } from './badge.variants';

@Component({
  imports: [MimiBadge],
  template: `
    <span mimiBadge [variant]="variant()" [class]="extra()">
      <svg data-test="icon"></svg>
      Nuevo
    </span>
  `,
})
class Host {
  readonly variant = signal<BadgeVariant>('default');
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
    expect(badge.dataset['variant']).toBe('default');
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

  it.each<[BadgeVariant, string[]]>([
    ['default', ['bg-primary', 'text-primary-foreground', 'border-transparent']],
    ['secondary', ['bg-secondary', 'text-secondary-foreground', 'border-transparent']],
    ['outline', ['bg-transparent', 'text-foreground', 'border-border']],
    ['destructive', ['bg-destructive', 'text-destructive-foreground', 'border-transparent']],
  ])('variante %s', async (variant, expected) => {
    const { host, badge, update } = await setup();
    await update(() => host.variant.set(variant));
    expect(badge.dataset['variant']).toBe(variant);
    for (const cls of expected) expect(badge.classList).toContain(cls);
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
