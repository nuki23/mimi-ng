import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiSkeleton } from './skeleton';

@Component({
  imports: [MimiSkeleton],
  template: `<mimi-skeleton [class]="extra()" />`,
})
class Host {
  readonly extra = signal('');
}

describe('MimiSkeleton', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const skeleton = (fixture.nativeElement as HTMLElement).querySelector('mimi-skeleton')!;
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    return { host: fixture.componentInstance, skeleton, update };
  }

  it('tiene el fondo, el radio y la animación del diseño', async () => {
    const { skeleton } = await setup();
    for (const cls of [
      'block',
      'rounded-[var(--mimi-skeleton-radius,var(--mimi-radius-sm))]',
      'bg-[color:var(--mimi-skeleton-bg,var(--mimi-muted))]',
      'animate-[mimi-pulse_var(--mimi-skeleton-duration,1.6s)_ease-in-out_infinite]',
    ]) {
      expect(skeleton.classList).toContain(cls);
    }
  });

  it('con movimiento reducido queda quieto', async () => {
    const { skeleton } = await setup();
    expect(skeleton.classList).toContain('motion-reduce:animate-none');
  });

  it('se oculta a los lectores de pantalla y no tiene contenido', async () => {
    const { skeleton } = await setup();
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
    expect(skeleton.childNodes.length).toBe(0);
  });

  it('la clase del usuario gana', async () => {
    const { host, skeleton, update } = await setup();
    await update(() => host.extra.set('size-12 rounded-full bg-accent animate-none'));
    for (const cls of ['size-12', 'rounded-full', 'bg-accent', 'animate-none']) {
      expect(skeleton.classList).toContain(cls);
    }
    for (const cls of [
      'rounded-[var(--mimi-skeleton-radius,var(--mimi-radius-sm))]',
      'bg-[color:var(--mimi-skeleton-bg,var(--mimi-muted))]',
      'animate-[mimi-pulse_var(--mimi-skeleton-duration,1.6s)_ease-in-out_infinite]',
    ]) {
      expect(skeleton.classList).not.toContain(cls);
    }
  });
});
