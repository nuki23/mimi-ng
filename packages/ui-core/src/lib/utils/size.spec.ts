import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiAvatar } from '@/components/ui/avatar';
import { MimiButton } from '@/components/ui/button';
import { MimiInput } from '@/components/ui/input';
import type { AvatarSize } from '@/components/ui/avatar';
import type { ButtonSize } from '@/components/ui/button';
import type { InputSize } from '@/components/ui/input';
import { MimiSizeScope, type MimiSize } from './size';

// R.32: `default` (el nombre viejo de `md`) ya no es un tamaño. Si vuelve, esto no compila.
// @ts-expect-error `default` se quitó en la 0.7.0.
const OLD_BUTTON: ButtonSize = 'default';
// @ts-expect-error `default` se quitó en la 0.7.0.
const OLD_INPUT: InputSize = 'default';
// @ts-expect-error `default` se quitó en la 0.7.0.
const OLD_AVATAR: AvatarSize = 'default';
// @ts-expect-error `default` se quitó en la 0.7.0.
const OLD_SCALE: MimiSize = 'default';
void [OLD_BUTTON, OLD_INPUT, OLD_AVATAR, OLD_SCALE];

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
  `,
})
class Host {
  readonly scope = signal<MimiSize>('sm');
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
    // Sin tamaño propio no hay data-size en el control: lo da el contenedor más cercano por la
    // cascada y, si no hay ninguno, el `md` del tema (:root).
    const near = (e: HTMLElement) => e.closest('[data-size]')?.getAttribute('data-size') ?? null;
    expect(q('outside').hasAttribute('data-size')).toBe(false);
    expect(near(q('outside'))).toBeNull();
    for (const id of ['inherit', 'field', 'avatar']) {
      expect(q(id).hasAttribute('data-size'), id).toBe(false);
      expect(near(q(id)), id).toBe('sm');
    }
    expect(q('own').dataset['size']).toBe('lg');
    expect(q('icon').dataset['size']).toBe('icon');
    host.scope.set('lg');
    await fixture.whenStable();
    expect(near(q('inherit'))).toBe('lg');
  });

  it('el contenedor más cercano gana', async () => {
    const { q } = await setup();
    expect(q('nested').closest('[data-size]')?.getAttribute('data-size')).toBe('lg');
  });

  it('los controles del mismo tamaño dan la misma altura (variables de la escala)', async () => {
    const { q } = await setup();
    // Botón y campo leen su alto de la escala del tema; `sm` (data-size) lo resuelve a 2rem, lo
    // comprueba `theme/size-scale.spec.ts`.
    expect(q('inherit').closest('[data-size]')?.getAttribute('data-size')).toBe('sm');
    expect(q('field').closest('[data-size]')?.getAttribute('data-size')).toBe('sm');
    expect([...q('inherit').classList].join(' ')).toContain('h-[var(--mimi-btn-h,');
    expect([...q('field').classList].join(' ')).toContain('h-[var(--mimi-input-h,');
    // Un contenedor con mimiSize pone data-size: la escala llega por CSS a quien no tiene size.
    expect(q('inherit').closest('[data-size]')).not.toBeNull();
  });

  it('ya no avisa de `default` (R.32): no hay alias que normalizar', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await setup();
    expect(warn.mock.calls.filter(([m]) => String(m).includes('Size:'))).toEqual([]);
    warn.mockRestore();
  });
});
