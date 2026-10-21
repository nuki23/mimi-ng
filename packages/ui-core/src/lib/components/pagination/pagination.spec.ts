import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type MimiPaginationEvent,
  MimiPagination,
  type MimiPaginationSize,
  type MimiPaginationVariant,
} from './pagination';
import { MIMI_PAGINATION_TEXT_ES, provideMimiPaginationText } from './pagination-texts';

@Component({
  imports: [MimiPagination],
  template: `
    <form (submit)="submits = submits + 1; $event.preventDefault()">
      <mimi-pagination
        [(page)]="page"
        [(pageSize)]="pageSize"
        [total]="total()"
        [pageSizeOptions]="options()"
        [size]="size()"
        [variant]="variant()"
        [disabled]="off()"
        [class]="extra()"
        (paginate)="events.push($event)"
      />
    </form>
  `,
})
class Host {
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly total = signal(120);
  readonly options = signal<number[]>([]);
  readonly size = signal<MimiPaginationSize>('sm');
  readonly variant = signal<MimiPaginationVariant>('inline');
  readonly off = signal(false);
  readonly extra = signal('');
  readonly events: (MimiPaginationEvent | Event)[] = [];
  submits = 0;
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiPagination', () => {
  let announce: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    // jsdom no lo implementa; Select (aria) lo usa al abrir.
    Element.prototype.scrollIntoView ??= () => undefined;
  });
  afterEach(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  async function setup() {
    announce = vi.fn(() => Promise.resolve());
    TestBed.configureTestingModule({
      providers: [
        provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES),
        { provide: LiveAnnouncer, useValue: { announce } },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const nav = root.querySelector<HTMLElement>('mimi-pagination')!;
    const prev = () => nav.querySelector<HTMLButtonElement>('[aria-label="Página anterior"]')!;
    const next = () => nav.querySelector<HTMLButtonElement>('[aria-label="Página siguiente"]')!;
    const field = () => nav.querySelector<HTMLInputElement>('input')!;
    const key = async (target: HTMLElement, k: string) => {
      const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      await settle(fixture);
      return event;
    };
    const type = async (text: string) => {
      field().focus();
      field().value = text;
      field().dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    const pages = () =>
      (fixture.componentInstance.events as MimiPaginationEvent[]).map((e) => e.page);
    return {
      fixture,
      h: fixture.componentInstance,
      root,
      nav,
      prev,
      next,
      field,
      key,
      type,
      pages,
    };
  }

  it('región de navegación con nombre; nombres de los botones y del campo; el total oculto', async () => {
    const { nav, prev, next, field } = await setup();
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Paginación');
    expect(prev().type).toBe('button');
    expect(next().type).toBe('button');
    // Son mimiBtn ghost de ícono (con aria-disabled propio, que Button conserva).
    expect(prev().dataset['variant']).toBe('ghost');
    expect(next().dataset['size']).toBe('icon');
    expect(field().getAttribute('aria-label')).toBe('Página, de 12');
    expect(field().value).toBe('1');
    expect(field().getAttribute('inputmode')).toBe('numeric');
    expect(field().getAttribute('maxlength')).toBe('2');
    const total = nav.querySelector('[data-slot="total"]')!;
    expect(total.getAttribute('aria-hidden')).toBe('true');
    expect(total.textContent?.trim()).toBe('/ 12');
    expect(nav.dataset['size']).toBe('sm');
    expect(nav.dataset['variant']).toBe('inline');
    // Sin pageSizeOptions, sin selector.
    expect(nav.querySelector('[data-slot="page-size"]')).toBeNull();
  });

  it('← y →: cambian la página, emiten y anuncian una vez; en los extremos, aria-disabled sin perder el foco', async () => {
    const { fixture, h, prev, next, pages } = await setup();
    expect(prev().getAttribute('aria-disabled')).toBe('true');
    expect(prev().hasAttribute('disabled')).toBe(false);
    next().click();
    await settle(fixture);
    expect(h.page()).toBe(2);
    expect(pages()).toEqual([2]);
    expect(announce).toHaveBeenCalledWith('Página 2 de 12', 'polite');
    expect(prev().hasAttribute('aria-disabled')).toBe(false);
    h.page.set(11);
    await settle(fixture);
    // Un cambio desde fuera no se anuncia.
    expect(announce).toHaveBeenCalledTimes(1);
    next().focus();
    next().click();
    await settle(fixture);
    expect(h.page()).toBe(12);
    expect(next().getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(next());
    // Deshabilitado: el clic (también el de Enter o Espacio) no hace nada.
    next().click();
    await settle(fixture);
    expect(h.page()).toBe(12);
    expect(pages()).toEqual([2, 12]);
  });

  it('campo: solo dígitos; Enter válido va a la página; Enter dentro de un form no lo envía', async () => {
    const { h, field, key, type, pages } = await setup();
    await type('1a2');
    expect(field().value).toBe('12');
    await type('7');
    const enter = await key(field(), 'Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(h.page()).toBe(7);
    // El campo muestra la página nueva (no la vieja).
    expect(field().value).toBe('7');
    expect(pages()).toEqual([7]);
    expect(h.submits).toBe(0);
    expect(announce).toHaveBeenCalledWith('Página 7 de 12', 'polite');
    // La misma página: no emite ni anuncia.
    await type('7');
    await key(field(), 'Enter');
    expect(pages()).toEqual([7]);
    expect(announce).toHaveBeenCalledTimes(1);
  });

  it('Enter inválido: error del diseño (aria-invalid, globo con role="alert" enlazado), recreado en cada intento', async () => {
    const { nav, h, field, key, type } = await setup();
    await type('40');
    await key(field(), 'Enter');
    expect(h.page()).toBe(1);
    expect(field().getAttribute('aria-invalid')).toBe('true');
    const alert = nav.querySelector<HTMLElement>('[role="alert"]')!;
    expect(alert.textContent?.trim()).toBe('Entre 1 y 12');
    expect(field().getAttribute('aria-describedby')).toBe(alert.id);
    expect(field().value).toBe('40');
    await key(field(), 'Enter');
    expect(nav.querySelector('[role="alert"]')).not.toBe(alert);
    // Escape vuelve a la actual y quita el error.
    await key(field(), 'Escape');
    expect(field().value).toBe('1');
    expect(field().hasAttribute('aria-invalid')).toBe(false);
    expect(nav.querySelector('[role="alert"]')).toBeNull();
  });

  it('al salir del campo: válido se aplica; inválido vuelve a la actual sin error', async () => {
    const { fixture, h, field, type } = await setup();
    await type('5');
    field().blur();
    await settle(fixture);
    expect(h.page()).toBe(5);
    expect(field().value).toBe('5');
    await type('99');
    field().blur();
    await settle(fixture);
    expect(h.page()).toBe(5);
    expect(field().value).toBe('5');
    expect(field().hasAttribute('aria-invalid')).toBe(false);
  });

  it('↑ y ↓ en el campo cambian de página', async () => {
    const { h, field, key } = await setup();
    field().focus();
    await key(field(), 'ArrowUp');
    await key(field(), 'ArrowUp');
    expect(h.page()).toBe(3);
    await key(field(), 'ArrowDown');
    expect(h.page()).toBe(2);
  });

  it('la salida paginate no recibe el change nativo del campo', async () => {
    const { fixture, h, field } = await setup();
    field().dispatchEvent(new Event('change', { bubbles: true }));
    await settle(fixture);
    expect(h.events).toEqual([]);
  });

  it('página fuera de rango desde fuera: se pinta acotada y el modelo no se reescribe', async () => {
    const { fixture, h, field, next } = await setup();
    h.page.set(5);
    h.total.set(0);
    await settle(fixture);
    expect(field().value).toBe('1');
    expect(field().getAttribute('aria-label')).toBe('Página, de 1');
    expect(next().getAttribute('aria-disabled')).toBe('true');
    expect(h.page()).toBe(5);
    expect(h.events).toEqual([]);
    h.total.set(120);
    await settle(fixture);
    expect(field().value).toBe('5');
  });

  it('pageSize 0, NaN o total negativo no rompen nada', async () => {
    const { fixture, h, field } = await setup();
    h.pageSize.set(0);
    h.total.set(-3);
    await settle(fixture);
    expect(field().getAttribute('aria-label')).toBe('Página, de 1');
    h.pageSize.set(Number.NaN);
    h.total.set(5);
    await settle(fixture);
    expect(field().getAttribute('aria-label')).toBe('Página, de 5');
  });

  it('registros por página: selector diferido; cambiar el tamaño mantiene el primer registro visible y emite una vez', async () => {
    const { fixture, h, nav } = await setup();
    h.options.set([10, 25, 50]);
    h.page.set(4);
    await settle(fixture);
    const wrapper = nav.querySelector<HTMLElement>('[data-slot="page-size"]')!;
    expect(wrapper.classList).toContain('max-sm:hidden');
    const trigger = wrapper.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    expect(trigger.getAttribute('aria-label')).toBe('Registros por página');
    expect(trigger.textContent?.trim()).toBe('10 / pág.');
    trigger.focus();
    trigger.click();
    await settle(fixture);
    const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find((o) =>
      o.textContent?.includes('25 / pág.'),
    )!;
    option.click();
    await settle(fixture);
    // Página 4 de 10 en 10: el registro 31; de 25 en 25 está en la página 2.
    expect(h.pageSize()).toBe(25);
    expect(h.page()).toBe(2);
    expect(h.events).toEqual([{ page: 2, pageSize: 25 }]);
    expect(announce).toHaveBeenCalledWith('Página 2 de 5', 'polite');
  });

  it('un pageSize que no está en las opciones se agrega (con aviso)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, h, nav } = await setup();
    h.pageSize.set(15);
    h.options.set([10, 25]);
    await settle(fixture);
    const trigger = nav.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    expect(trigger.textContent?.trim()).toBe('15 / pág.');
    warn.mockRestore();
  });

  it('disabled: nada cambia y el foco se queda donde estaba', async () => {
    const { fixture, h, next, field, key, type } = await setup();
    next().focus();
    h.off.set(true);
    await settle(fixture);
    expect(document.activeElement).toBe(next());
    expect(next().getAttribute('aria-disabled')).toBe('true');
    next().click();
    expect(field().readOnly).toBe(true);
    expect(field().getAttribute('aria-disabled')).toBe('true');
    await type('3');
    await key(field(), 'Enter');
    await key(field(), 'ArrowUp');
    expect(h.page()).toBe(1);
    expect(h.events).toEqual([]);
  });

  it('tamaños, variantes, data-* y class con cn()', async () => {
    const { fixture, h, nav, next, field } = await setup();
    for (const cls of [
      'rounded-full',
      'p-[3px]',
      'gap-[4px]',
      'shadow-neutral',
      'bg-[color:var(--mimi-pagination-bg,var(--mimi-glass))]',
      'border-[color:var(--mimi-pagination-border,var(--mimi-glass-border))]',
      'backdrop-blur-[var(--mimi-pagination-blur,var(--mimi-glass-blur))]',
    ]) {
      expect(nav.classList).toContain(cls);
    }
    expect(next().classList).toContain(
      'size-[var(--mimi-pagination-item-size,var(--mimi-control-height-sm,2rem))]',
    );
    expect(next().classList).toContain('active:scale-(--mimi-press-scale-sm)');
    expect(field().classList).toContain('w-[var(--mimi-pagination-input-width,44px)]');
    expect(field().classList).not.toContain('w-full');
    h.size.set('default');
    h.variant.set('floating');
    h.off.set(true);
    h.extra.set('p-2 absolute bottom-4');
    await settle(fixture);
    expect(nav.dataset['size']).toBe('default');
    expect(nav.dataset['variant']).toBe('floating');
    expect(nav.dataset['disabled']).toBe('');
    expect(nav.classList).toContain(
      'shadow-[shadow:var(--mimi-pagination-shadow,var(--mimi-shadow-popover))]',
    );
    expect(nav.classList).toContain('p-2');
    expect(nav.classList).not.toContain('p-[4px]');
    expect(next().classList).toContain(
      'size-[var(--mimi-pagination-item-size,var(--mimi-control-height,2.5rem))]',
    );
    expect(field().classList).toContain('w-[var(--mimi-pagination-input-width,52px)]');
  });
});
