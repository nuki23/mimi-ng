import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiAvatar } from '@/components/ui/avatar';
import { MimiButton } from '@/components/ui/button';
import { MimiInput } from '@/components/ui/input';
import { MimiSizeScope, type MimiSizeInput } from './size';

/** R.1: escala común `sm | md | lg` y herencia con `mimiSize`. */
@Component({
  imports: [MimiSizeScope, MimiButton, MimiInput, MimiAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section [mimiSize]="scope()">
      <button mimiBtn id="inherit">A</button>
      <button mimiBtn id="own" size="lg">B</button>
      <button mimiBtn id="icon" size="icon">C</button>
      <input mimiInput id="field" />
      <mimi-avatar id="avatar" />
      <section mimiSize="lg"><button mimiBtn id="nested">D</button></section>
    </section>
    <button mimiBtn id="outside">E</button>
    <button mimiBtn id="old" [size]="old()">F</button>
  `,
})
class Host {
  readonly scope = signal<MimiSizeInput>('sm');
  readonly old = signal<MimiSizeInput | 'icon'>('default');
}

describe('escala de tamaños (R.1)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = (id: string) => el.querySelector<HTMLElement>(`#${id}`)!;
    return { fixture, host: fixture.componentInstance, q };
  }

  it('sin tamaño propio ni contenedor, md; el contenedor lo cambia; el propio gana', async () => {
    const { q, host, fixture } = await setup();
    expect(q('outside').dataset['size']).toBe('md');
    for (const id of ['inherit', 'field', 'avatar']) expect(q(id).dataset['size']).toBe('sm');
    expect(q('own').dataset['size']).toBe('lg');
    expect(q('icon').dataset['size']).toBe('icon');
    host.scope.set('lg');
    await fixture.whenStable();
    expect(q('inherit').dataset['size']).toBe('lg');
  });

  it('el contenedor más cercano gana', async () => {
    const { q } = await setup();
    expect(q('nested').dataset['size']).toBe('lg');
  });

  it('los controles del mismo tamaño dan la misma altura (variables de la escala)', async () => {
    const { q } = await setup();
    const heightOf = (id: string) =>
      [...q(id).classList].find((c) => /^h-\[var\(--mimi-(btn|input)-height-sm/.test(c))!;
    expect(heightOf('inherit')).toContain('var(--mimi-control-height-sm,2rem)');
    expect(heightOf('field')).toContain('var(--mimi-control-height-sm,2rem)');
  });

  it('`default` es un alias de `md` y avisa una vez en desarrollo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { q, fixture, host } = await setup();
    expect(q('old').dataset['size']).toBe('md');
    host.old.set('default');
    await fixture.whenStable();
    expect(
      warn.mock.calls.filter(([m]) => String(m).includes('MimiButton')).length,
    ).toBeLessThanOrEqual(1);
    warn.mockRestore();
  });
});
