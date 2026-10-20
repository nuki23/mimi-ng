import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import { MimiTabsImports, type MimiTabsVariant } from './tabs';

let created: string[] = [];

@Component({ selector: 'test-panel', template: '<p>{{ name() }}</p>' })
class Panel {
  readonly name = input('');
  constructor() {
    queueMicrotask(() => created.push(this.name()));
  }
}

interface TabDef {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

@Component({
  imports: [MimiTabsImports, Panel],
  template: `
    <button data-test="before">Antes</button>
    <mimi-tabs
      [(value)]="value"
      [variant]="variant()"
      [preserveContent]="preserve()"
      aria-label="Secciones"
      [class]="extra()"
      [panelClass]="panelExtra()"
    >
      @for (t of tabs(); track t.value) {
        <ng-template
          [mimiTab]="t.value"
          [label]="t.label"
          [count]="t.count"
          [disabled]="!!t.disabled"
        >
          <test-panel [name]="t.value" />
        </ng-template>
      }
      @if (iconLabel()) {
        <ng-template mimiTabLabel="b"><svg data-test="icon"></svg></ng-template>
      }
    </mimi-tabs>
  `,
})
class Host {
  readonly value = signal<string | undefined>(undefined);
  readonly variant = signal<MimiTabsVariant>('underline');
  readonly preserve = signal(false);
  readonly extra = signal('');
  readonly panelExtra = signal('');
  readonly iconLabel = signal(false);
  readonly tabs = signal<TabDef[]>([
    { value: 'a', label: 'Cuenta' },
    { value: 'b', label: 'Avisos', count: 3 },
    { value: 'c', label: 'Facturación', disabled: true },
    { value: 'd', label: 'Equipo' },
  ]);
}

/** aria directo, sin Mimi: para las alarmas de los dos choques. */
@Component({
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
  template: `
    <div ngTabs>
      <div ngTabList [(selectedTab)]="selected">
        <button ngTab value="uno">Uno</button>
        <button ngTab value="dos">Dos</button>
      </div>
      <div ngTabPanel value="uno"><ng-template ngTabContent>Uno</ng-template></div>
      <div ngTabPanel value="dos"><ng-template ngTabContent>Dos</ng-template></div>
    </div>
  `,
})
class AriaHost {
  readonly selected = signal<string | undefined>('uno');
}

@Component({
  imports: [MimiTabsImports],
  template: `
    <mimi-tabs aria-label="Fuera">
      <ng-template mimiTab="x" label="X">
        <mimi-tabs aria-label="Dentro">
          <ng-template mimiTab="y" label="Y">Y</ng-template>
          <ng-template mimiTab="z" label="Z">Z</ng-template>
        </mimi-tabs>
      </ng-template>
      <ng-template mimiTab="w" label="W">W</ng-template>
    </mimi-tabs>
  `,
})
class NestedHost {}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiTabs', () => {
  beforeEach(() => (created = []));
  // El foco que queda en una pestaña afecta al :focus-visible de las pruebas que siguen (Tooltip).
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = root.querySelector<HTMLElement>('mimi-tabs')!;
    const tabs = () => Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const tab = (value: string) => tabs().find((t) => t.dataset['value'] === value)!;
    const panels = () => Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    const visible = () => panels().filter((p) => !p.hidden);
    const focusable = () => tabs().filter((t) => t.getAttribute('tabindex') === '0');
    const key = async (key: string) => {
      (document.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
      );
      await settle(fixture);
    };
    return {
      fixture,
      h: fixture.componentInstance,
      root,
      host,
      tabs,
      tab,
      panels,
      visible,
      focusable,
      key,
      list: () => root.querySelector<HTMLElement>('[data-slot="list"]')!,
      tablist: () => root.querySelector<HTMLElement>('[role="tablist"]')!,
      indicator: () => root.querySelector<HTMLElement>('[data-slot="indicator"]')!,
    };
  }

  it('roles, atributos y data-*; el anfitrión queda sin class ni aria-label', async () => {
    const { host, tablist, tabs, tab, panels, list } = await setup();
    expect(host.hasAttribute('aria-label')).toBe(false);
    expect(host.hasAttribute('class')).toBe(false);
    expect(host.dataset['variant']).toBe('underline');
    expect(tablist().getAttribute('aria-label')).toBe('Secciones');
    expect(tabs().length).toBe(4);
    const a = tab('a');
    expect(a.getAttribute('aria-selected')).toBe('true');
    expect(a.getAttribute('type')).toBe('button');
    expect(a.dataset['state']).toBe('active');
    const panel = document.getElementById(a.getAttribute('aria-controls')!)!;
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(a.id);
    expect(tab('c').getAttribute('aria-disabled')).toBe('true');
    expect(tab('c').hasAttribute('data-disabled')).toBe(true);
    expect(panels().length).toBe(4);
    expect(list().style.getPropertyValue('--mimi-tabs-count')).toBe('4');
    expect(list().style.getPropertyValue('--mimi-tabs-index')).toBe('0');
  });

  it('sin valor elige la primera habilitada y la escribe; si vuelve a undefined, otra vez', async () => {
    const { fixture, h, visible } = await setup();
    expect(h.value()).toBe('a');
    expect(visible().length).toBe(1);
    expect(visible()[0].textContent).toContain('a');
    h.value.set('d');
    await settle(fixture);
    h.value.set(undefined);
    await settle(fixture);
    expect(h.value()).toBe('a');
  });

  it('contenido diferido: solo se crea el panel elegido; sin preserveContent se destruye', async () => {
    const { fixture, h, panels } = await setup();
    expect(created).toEqual(['a']);
    h.value.set('b');
    await settle(fixture);
    expect(created).toEqual(['a', 'b']);
    expect(panels()[0].textContent!.trim()).toBe('');
    h.value.set('a');
    await settle(fixture);
    expect(created).toEqual(['a', 'b', 'a']);
  });

  it('preserveContent conserva los paneles (también si se activa en caliente)', async () => {
    const { fixture, h, panels } = await setup();
    h.preserve.set(true);
    await settle(fixture);
    h.value.set('b');
    await settle(fixture);
    h.value.set('a');
    await settle(fixture);
    expect(created).toEqual(['a', 'b']);
    expect(panels()[1].textContent).toContain('b');
    expect(panels()[1].hidden).toBe(true);
  });

  it('teclado: flechas con vuelta, Inicio y Fin eligen; la deshabilitada se enfoca pero no se elige', async () => {
    const { h, tab, key } = await setup();
    tab('a').focus();
    await key('ArrowRight');
    expect(h.value()).toBe('b');
    await key('ArrowRight');
    expect(document.activeElement).toBe(tab('c'));
    expect(h.value()).toBe('b');
    await key('ArrowRight');
    expect(h.value()).toBe('d');
    await key('ArrowRight');
    expect(h.value()).toBe('a');
    await key('End');
    expect(h.value()).toBe('d');
    await key('Home');
    expect(h.value()).toBe('a');
  });

  it('clic elige; en la deshabilitada no', async () => {
    const { fixture, h, tab } = await setup();
    tab('d').click();
    await settle(fixture);
    expect(h.value()).toBe('d');
    tab('c').click();
    await settle(fixture);
    expect(h.value()).toBe('d');
  });

  it('alarma (choque 1): aria vacía su modelo si el valor no tiene pestaña', async () => {
    const fixture = TestBed.createComponent(AriaHost);
    await settle(fixture);
    fixture.componentInstance.selected.set('no-existe');
    await settle(fixture);
    // Si aria deja de hacerlo, revisar la nota de la spec 4 y el plan (G1.5b).
    expect(fixture.componentInstance.selected()).toBeUndefined();
  });

  it('choque 1 contenido: un valor sin pestaña no se pierde y se elige cuando llega', async () => {
    const { fixture, h, tab, visible } = await setup();
    h.tabs.update((tabs) => tabs.filter((t) => t.value !== 'd'));
    await settle(fixture);
    h.value.set('d');
    await settle(fixture);
    expect(h.value()).toBe('d');
    expect(visible()[0].textContent).toContain('a');
    h.tabs.update((tabs) => [...tabs, { value: 'd', label: 'Equipo' }]);
    await settle(fixture);
    expect(h.value()).toBe('d');
    expect(tab('d').getAttribute('aria-selected')).toBe('true');
    expect(visible()[0].textContent).toContain('d');
  });

  it('clic en la pestaña que se muestra mientras se espera otro valor la elige', async () => {
    const { fixture, h, tab } = await setup();
    h.value.set('no-existe');
    await settle(fixture);
    expect(tab('a').getAttribute('aria-selected')).toBe('true');
    tab('a').click();
    await settle(fixture);
    expect(h.value()).toBe('a');
  });

  it('alarma (choque 2): con aria, después de interactuar el valor desde código no mueve el tabindex', async () => {
    const fixture = TestBed.createComponent(AriaHost);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const [uno, dos] = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'));
    dos.focus();
    dos.click();
    await settle(fixture);
    dos.blur();
    fixture.componentInstance.selected.set('uno');
    await settle(fixture);
    expect(uno.getAttribute('aria-selected')).toBe('true');
    // Si aria empieza a mover el tabindex, revisar el rodeo (recrear el ngTabList).
    expect(dos.getAttribute('tabindex')).toBe('0');
  });

  it('choque 2 contenido: después de interactuar, el valor desde código mueve el tabindex', async () => {
    const { fixture, h, tab, focusable } = await setup();
    tab('b').focus();
    tab('b').click();
    await settle(fixture);
    (document.activeElement as HTMLElement).blur();
    h.value.set('d');
    await settle(fixture);
    expect(focusable()).toEqual([tab('d')]);
  });

  it('choque 2 contenido: quitar la pestaña activa deja otra alcanzable con Tab', async () => {
    const { fixture, h, tab, focusable } = await setup();
    tab('d').focus();
    tab('d').click();
    await settle(fixture);
    h.tabs.update((tabs) => tabs.filter((t) => t.value !== 'd'));
    await settle(fixture);
    expect(focusable().length).toBe(1);
    expect(focusable()[0]).toBe(tab('a'));
  });

  it('con el foco dentro no se recrea la fila (el foco no se pierde)', async () => {
    const { fixture, h, tab } = await setup();
    tab('b').focus();
    h.value.set('d');
    await settle(fixture);
    expect(document.activeElement).toBe(tab('b'));
  });

  it('variantes: clases del diseño y tokens; class y panelClass ganan; cambio en caliente', async () => {
    const { fixture, h, host, list, tab, indicator, visible } = await setup();
    for (const cls of ['border-b', 'border-border']) expect(list().classList).toContain(cls);
    for (const cls of [
      'h-[var(--mimi-tabs-height,44px)]',
      'text-sm',
      'text-[color:var(--mimi-tabs-fg,var(--mimi-muted-foreground))]',
      'aria-selected:text-[color:var(--mimi-tabs-active-fg,var(--mimi-foreground))]',
      'not-aria-disabled:active:scale-(--mimi-press-scale)',
    ]) {
      expect(tab('a').classList).toContain(cls);
    }
    for (const cls of [
      'h-0.5',
      'w-[calc(100%_/_var(--mimi-tabs-count))]',
      'translate-x-[calc(100%_*_var(--mimi-tabs-index))]',
      'rtl:translate-x-[calc(-100%_*_var(--mimi-tabs-index))]',
      'bg-[color:var(--mimi-tabs-indicator,var(--mimi-foreground))]',
      'motion-reduce:transition-none',
      'ease-[var(--mimi-tabs-spring,cubic-bezier(0.3,1.35,0.5,1))]',
    ]) {
      expect(indicator().classList).toContain(cls);
    }

    h.variant.set('pill');
    h.extra.set('max-w-none');
    h.panelExtra.set('py-4');
    await settle(fixture);
    expect(host.dataset['variant']).toBe('pill');
    for (const cls of [
      'bg-[color:var(--mimi-tabs-pill-bg,var(--mimi-muted))]',
      'p-[4px]',
      'max-w-none',
    ]) {
      expect(list().classList).toContain(cls);
    }
    expect(list().classList).not.toContain('max-w-[520px]');
    expect(tab('a').classList).toContain('h-[34px]');
    for (const cls of [
      'w-[calc((100%_-_8px)_/_var(--mimi-tabs-count))]',
      'bg-[color:var(--mimi-tabs-pill-active,var(--mimi-card))]',
      'shadow-neutral',
      'start-[4px]',
    ]) {
      expect(indicator().classList).toContain(cls);
    }
    // El indicador va antes de la fila: en la píldora, el fondo queda debajo del texto.
    expect(list().firstElementChild).toBe(indicator());
    expect(visible()[0].classList).toContain('py-4');
    expect(visible()[0].classList).not.toContain('py-1');
  });

  it('el panel y la fila muestran el anillo de foco (sin outline-none, que lo anula)', async () => {
    const { visible, tablist } = await setup();
    for (const node of [visible()[0], tablist()]) {
      expect(node.classList).toContain('focus-visible:outline-2');
      expect(node.classList).not.toContain('outline-none');
    }
  });

  it('contador; etiqueta propia; solo ícono usa label como nombre y avisa si falta', async () => {
    const { fixture, h, tab } = await setup();
    const count = tab('b').querySelector('[data-slot="count"]')!;
    expect(count.textContent).toBe('3');
    expect(count.classList).toContain('bg-info-soft');
    h.iconLabel.set(true);
    await settle(fixture);
    expect(tab('b').querySelector('[data-test="icon"]')).not.toBeNull();
    expect(tab('b').getAttribute('aria-label')).toBe('Avisos');
    expect(tab('a').hasAttribute('aria-label')).toBe(false);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    h.tabs.update((tabs) => tabs.map((t) => (t.value === 'b' ? { ...t, label: '' } : t)));
    await settle(fixture);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no tiene label'));
    warn.mockRestore();
  });

  it('avisa en desarrollo de valores repetidos o vacíos', async () => {
    const { fixture, h } = await setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    h.tabs.set([
      { value: 'a', label: 'A' },
      { value: 'a', label: 'A otra vez' },
    ]);
    await settle(fixture);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('valores repetidos'));
    warn.mockRestore();
  });

  it('sin pestañas no se pinta la fila; todas deshabilitadas: la fila recibe el foco', async () => {
    const { fixture, h, root, tablist } = await setup();
    h.tabs.set([]);
    await settle(fixture);
    expect(root.querySelector('[role="tablist"]')).toBeNull();
    h.tabs.set([
      { value: 'x', label: 'X', disabled: true },
      { value: 'y', label: 'Y', disabled: true },
    ]);
    await settle(fixture);
    expect(tablist().getAttribute('tabindex')).toBe('0');
    expect(tablist().classList).toContain('focus-visible:outline-2');
  });

  it('pestañas reordenadas: el indicador sigue a la elegida', async () => {
    const { fixture, h, list } = await setup();
    h.value.set('d');
    await settle(fixture);
    expect(list().style.getPropertyValue('--mimi-tabs-index')).toBe('3');
    h.tabs.update((tabs) => [...tabs].reverse());
    await settle(fixture);
    expect(list().style.getPropertyValue('--mimi-tabs-index')).toBe('0');
  });

  it('Tabs anidadas: cada una tiene solo sus pestañas', async () => {
    const fixture = TestBed.createComponent(NestedHost);
    await settle(fixture);
    const lists = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="tablist"]'),
    );
    expect(lists.map((l) => l.getAttribute('aria-label'))).toEqual(['Fuera', 'Dentro']);
    expect(lists[0].querySelectorAll('[role="tab"]').length).toBe(2);
    expect(lists[1].querySelectorAll('[role="tab"]').length).toBe(2);
  });
});
