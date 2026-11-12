import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { type MimiCompareWith, mimiCompareFn } from '@/components/ui/option-list';
import { MimiSelectImports } from '@/components/ui/select';

interface User {
  id: number;
  name: string;
}

const USERS: User[] = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Bruno' },
];

/**
 * `compareWith` con atajo (12/11/2026): además de una función, el nombre de un campo
 * (`compareWith="id"`), en Select y Combobox. El valor es otro objeto (como el que llega guardado
 * de una API) con el mismo `id`: el componente lo reconoce y muestra su etiqueta.
 */
@Component({
  imports: [MimiSelectImports, MimiComboboxImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-select data-test="select" aria-label="Persona" [compareWith]="compare()" [(value)]="user">
      @for (u of users; track u.id) {
        <mimi-option [value]="u">{{ u.name }}</mimi-option>
      }
    </mimi-select>
    <mimi-combobox
      data-test="combobox"
      aria-label="Persona"
      [compareWith]="compare()"
      [(value)]="user"
    >
      @for (u of users; track u.id) {
        <mimi-option [value]="u">{{ u.name }}</mimi-option>
      }
    </mimi-combobox>
  `,
})
class Host {
  readonly users = USERS;
  readonly compare = signal<MimiCompareWith<User>>('id');
  readonly user = signal<User | null>({ id: 2, name: 'Bruno (guardado)' });
}

describe('compareWith: función o nombre de un campo (Select y Combobox)', () => {
  const tick = (ms = 40) => new Promise((r) => setTimeout(r, ms));

  async function setup(compare?: MimiCompareWith<User>) {
    const fixture = TestBed.createComponent(Host);
    if (compare) fixture.componentInstance.compare.set(compare);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await tick();
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      trigger: () =>
        el.querySelector('[data-test="select"] [role="combobox"]')!.textContent!.trim(),
      field: () => el.querySelector<HTMLInputElement>('[data-test="combobox"] input')!.value,
    };
  }

  it('con compareWith="id", otro objeto con el mismo id es la opción elegida', async () => {
    const { trigger, field } = await setup();
    expect(trigger()).toBe('Bruno');
    expect(field()).toBe('Bruno');
  });

  it('con una función sigue igual', async () => {
    const { trigger, field } = await setup((a, b) => a.name.startsWith(b.name.slice(0, 5)));
    expect(trigger()).toBe('Bruno');
    expect(field()).toBe('Bruno');
  });

  it('con un campo que no coincide, no hay opción elegida', async () => {
    const { trigger, field } = await setup('name');
    // «Bruno (guardado)» no es «Bruno»: el disparador queda con el placeholder (vacío) y el campo vacío.
    expect(trigger()).toBe('');
    expect(field()).toBe('');
  });

  it('mimiCompareFn: campo en objetos, Object.is en valores sueltos', () => {
    const byId = mimiCompareFn<unknown>('id');
    expect(byId({ id: 1 }, { id: 1 })).toBe(true);
    expect(byId({ id: 1 }, { id: 2 })).toBe(false);
    expect(byId('a', 'a')).toBe(true);
    expect(byId('a', { id: 'a' })).toBe(false);
    expect(byId(null, { id: 1 })).toBe(false);
    const fn = (a: unknown, b: unknown) => a === b;
    expect(mimiCompareFn(fn)).toBe(fn);
  });
});
