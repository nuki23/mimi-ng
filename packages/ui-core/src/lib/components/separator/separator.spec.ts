import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiSeparator } from './separator';
import type { SeparatorOrientation } from './separator.variants';

@Component({
  imports: [MimiSeparator],
  template: `
    <mimi-separator
      id="dynamic"
      [orientation]="orientation()"
      [decorative]="decorative()"
      [class]="extra()"
    />
    <mimi-separator id="default" />
    <mimi-separator id="semantic" decorative="false" orientation="vertical" />
  `,
})
class Host {
  readonly orientation = signal<SeparatorOrientation>('horizontal');
  readonly decorative = signal(true);
  readonly extra = signal('');
}

describe('MimiSeparator', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const q = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    return { host: fixture.componentInstance, q, update };
  }

  it('por defecto: horizontal, 1px, color del borde y decorativa', async () => {
    const { q } = await setup();
    const sep = q('default');
    for (const cls of ['block', 'h-px', 'w-full', 'shrink-0', 'bg-border']) {
      expect(sep.classList).toContain(cls);
    }
    expect(sep.dataset['orientation']).toBe('horizontal');
    expect(sep.getAttribute('role')).toBe('none');
    expect(sep.hasAttribute('aria-orientation')).toBe(false);
    expect(sep.childNodes.length).toBe(0);
  });

  it('vertical: 1px de ancho y toma el alto de la fila', async () => {
    const { host, q, update } = await setup();
    await update(() => host.orientation.set('vertical'));
    const sep = q('dynamic');
    expect(sep.dataset['orientation']).toBe('vertical');
    expect(sep.classList).toContain('w-px');
    expect(sep.classList).toContain('self-stretch');
    expect(sep.classList).not.toContain('h-px');
    expect(sep.classList).not.toContain('w-full');
  });

  it('decorative="false": role="separator" con aria-orientation', async () => {
    const { host, q, update } = await setup();
    expect(q('semantic').getAttribute('role')).toBe('separator');
    expect(q('semantic').getAttribute('aria-orientation')).toBe('vertical');

    await update(() => host.decorative.set(false));
    expect(q('dynamic').getAttribute('role')).toBe('separator');
    expect(q('dynamic').getAttribute('aria-orientation')).toBe('horizontal');
    await update(() => host.orientation.set('vertical'));
    expect(q('dynamic').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('la clase del usuario gana', async () => {
    const { host, q, update } = await setup();
    await update(() => host.extra.set('bg-primary h-0.5 w-1/2'));
    const sep = q('dynamic');
    expect(sep.classList).toContain('bg-primary');
    expect(sep.classList).toContain('h-0.5');
    expect(sep.classList).toContain('w-1/2');
    expect(sep.classList).not.toContain('bg-border');
    expect(sep.classList).not.toContain('h-px');
    expect(sep.classList).not.toContain('w-full');
  });
});
