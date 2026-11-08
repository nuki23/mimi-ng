import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type MimiCommandGroup, MimiCommandImports, type MimiCommandItem } from './command';
import { MIMI_COMMAND_TEXT_ES, provideMimiCommandText } from './command-texts';

const GROUPS: MimiCommandGroup<string>[] = [
  {
    label: 'Sugerencias',
    items: [
      { id: 'new', label: 'Nuevo proyecto', shortcut: ['⌘', 'N'], tone: 'info' },
      { id: 'invite', label: 'Invitar al equipo', tone: 'success', disabled: true },
      { id: 'docs', label: 'Buscar en la documentación', keywords: ['ayuda', 'manual'] },
    ],
  },
  {
    label: 'Navegación',
    items: [
      { id: 'billing', label: 'Ir a facturación', data: '/billing' },
      { id: 'logout', label: 'Cerrar sesión', tone: 'danger' },
    ],
  },
];

@Component({
  imports: [MimiCommandImports],
  template: `
    <mimi-command
      data-test="inline"
      aria-label="Comandos"
      [items]="groups"
      [(query)]="query"
      [class]="extra()"
      (run)="ran.push($event)"
    >
      <ng-template mimiCommandIcon let-item>
        <svg data-test="icon" [attr.data-id]="item.id" viewBox="0 0 24 24"></svg>
      </ng-template>
      <button data-test="empty-action" mimiCommandEmpty>Buscar en la documentación</button>
    </mimi-command>
    <mimi-command data-test="loose" [items]="loose" />
    <button data-test="opener">Abrir</button>
    <mimi-command-dialog [(open)]="open" [items]="groups" (run)="dialogRan.push($event)">
      <ng-template mimiCommandIcon let-item>
        <svg data-test="dialog-icon" viewBox="0 0 24 24"></svg>
      </ng-template>
    </mimi-command-dialog>
  `,
})
class Host {
  readonly groups = GROUPS;
  readonly loose: MimiCommandItem[] = [
    { id: 'a', label: 'Uno' },
    { id: 'b', label: 'Dos' },
  ];
  readonly query = signal('');
  readonly extra = signal('');
  readonly open = signal(false);
  readonly ran: MimiCommandItem<string>[] = [];
  readonly dialogRan: MimiCommandItem<string>[] = [];
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiCommand', { timeout: 20_000 }, () => {
  beforeAll(() => {
    // jsdom no lo implementa; aria lo usa para traer el comando activo a la vista.
    Element.prototype.scrollIntoView ??= () => undefined;
  });

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const inline = root.querySelector<HTMLElement>('[data-test="inline"]')!;
    const input = (scope: Element = inline) => scope.querySelector<HTMLInputElement>('input')!;
    const options = (scope: Element = inline) =>
      Array.from(scope.querySelectorAll<HTMLElement>('[role="option"]'));
    const labels = (scope: Element = inline) => options(scope).map((o) => o.textContent!.trim());
    const active = (scope: Element = inline) =>
      document.getElementById(input(scope).getAttribute('aria-activedescendant') ?? '-');
    const press = async (target: Element, key: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
      target.dispatchEvent(event);
      await settle(fixture);
      return event;
    };
    const type = async (text: string, scope: Element = inline) => {
      const el = input(scope);
      el.focus();
      el.value = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      await settle(fixture);
    };
    const container = () => document.querySelector<HTMLElement>('.cdk-dialog-container');
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      inline,
      input,
      options,
      labels,
      active,
      press,
      type,
      container,
    };
  }

  afterEach(() => document.body.replaceChildren());

  it('combobox siempre abierto con su lista; grupos con nombre; el primero activo', async () => {
    const { inline, input, active } = await setup();
    const field = input();
    expect(field.getAttribute('role')).toBe('combobox');
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(field.getAttribute('aria-label')).toBe('Comandos');
    const listbox = inline.querySelector('[role="listbox"]')!;
    expect(field.getAttribute('aria-controls')).toBe(listbox.id);
    expect(listbox.getAttribute('aria-label')).toBe('Comandos');
    const groups = Array.from(inline.querySelectorAll('[role="group"]'));
    expect(
      groups.map((g) => document.getElementById(g.getAttribute('aria-labelledby')!)!.textContent),
    ).toEqual(['Sugerencias', 'Navegación']);
    expect(active()?.textContent).toContain('Nuevo proyecto');
    expect(inline.querySelector('[data-slot="count"]')!.textContent).toBe('5 results');
    expect(inline.querySelector('[data-slot="esc"]')).toBeNull();
  });

  it('filtra sin tildes y por keywords, resalta y cuenta; el primero queda activo', async () => {
    const { inline, labels, type, active, host } = await setup();
    await type('facturacion');
    expect(labels()).toEqual(['Ir a facturación']);
    expect(host.query()).toBe('facturacion');
    expect(inline.querySelector('mark')!.textContent).toBe('facturación');
    expect(active()?.textContent).toContain('Ir a facturación');
    expect(inline.querySelector('[data-slot="count"]')!.textContent).toBe('1 result');
    expect(inline.querySelector('[role="status"]')!.textContent!.trim()).toBe('1 result');
    await type('manual');
    expect(labels()).toEqual(['Buscar en la documentación']);
    // Un grupo sin resultados desaparece.
    expect(inline.querySelectorAll('[role="group"]').length).toBe(1);
  });

  it('↓ ↑ Fin Inicio mueven el activo (salta el deshabilitado); Enter ejecuta', async () => {
    const { input, active, press, host } = await setup();
    const field = input();
    field.focus();
    await press(field, 'ArrowDown');
    expect(active()?.textContent).toContain('Buscar en la documentación');
    await press(field, 'End');
    expect(active()?.textContent).toContain('Cerrar sesión');
    await press(field, 'ArrowUp');
    expect(active()?.textContent).toContain('Ir a facturación');
    expect(document.activeElement).toBe(field);
    const enter = await press(field, 'Enter');
    expect(enter.defaultPrevented).toBe(true);
    expect(host.ran.map((i) => i.id)).toEqual(['billing']);
    expect(host.ran[0].data).toBe('/billing');
    await press(field, 'Home');
    expect(active()?.textContent).toContain('Nuevo proyecto');
  });

  it('clic ejecuta; un comando deshabilitado no', async () => {
    const { options, host, fixture } = await setup();
    const disabled = options().find((o) => o.textContent!.includes('Invitar'))!;
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    disabled.click();
    await settle(fixture);
    expect(host.ran).toEqual([]);
    options()
      .find((o) => o.textContent!.includes('Cerrar sesión'))!
      .click();
    await settle(fixture);
    expect(host.ran.map((i) => i.id)).toEqual(['logout']);
  });

  it('sin resultados: título, texto y la acción propia; Escape vacía lo escrito', async () => {
    const { inline, type, press, input, labels, host } = await setup();
    await type('facturaz');
    const empty = inline.querySelector<HTMLElement>('[data-slot="empty"]')!;
    expect(empty.textContent).toContain('No results for “facturaz”');
    expect(empty.querySelector('[data-test="empty-action"]')).not.toBeNull();
    expect(inline.querySelector('[role="status"]')!.textContent!.trim()).toBe(
      'No results for “facturaz”',
    );
    expect(inline.querySelector('[data-slot="count"]')!.textContent).toBe('0 results');
    await press(input(), 'Escape');
    expect(host.query()).toBe('');
    expect(labels().length).toBe(5);
    expect(inline.querySelector('[data-slot="empty"]')).toBeNull();
  });

  it('ícono propio en su caja con el tono; atajos en kbd; sin plantilla no hay caja', async () => {
    const { inline, root, options } = await setup();
    const first = options()[0];
    const box = first.querySelector<HTMLElement>('[data-slot="icon"]')!;
    expect(box.querySelector('[data-test="icon"]')!.getAttribute('data-id')).toBe('new');
    expect(box.className).toContain('bg-info-soft');
    expect(box.className).toContain('group-data-[active=true]/command-item:bg-info');
    expect(box.className).toContain('size-[var(--mimi-command-icon-size,26px)]');
    const plain = options()[2].querySelector<HTMLElement>('[data-slot="icon"]')!;
    expect(plain.className).toContain('bg-muted');
    const danger = options()[4].querySelector<HTMLElement>('[data-slot="icon"]')!;
    expect(danger.className).toContain('bg-destructive-soft-bg');
    const keys = Array.from(first.querySelectorAll('[data-slot="shortcut"] kbd')).map(
      (k) => k.textContent,
    );
    expect(keys).toEqual(['⌘', 'N']);
    expect(first.querySelector('[data-slot="shortcut"]')!.getAttribute('aria-hidden')).toBe('true');
    const loose = root.querySelector('[data-test="loose"]')!;
    expect(loose.querySelectorAll('[role="option"]').length).toBe(2);
    expect(loose.querySelector('[data-slot="icon"]')).toBeNull();
    expect(loose.querySelector('[role="group"]')).toBeNull();
    expect(inline.querySelector('[data-slot="footer"]')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('class del usuario con cn(); tokens de la tabla', async () => {
    const { inline, options, host, fixture } = await setup();
    expect(inline.className).toContain('rounded-[var(--mimi-radius-card)]');
    expect(inline.querySelector('[data-slot="search"]')!.className).toContain(
      'h-[var(--mimi-command-input-height,52px)]',
    );
    expect(inline.querySelector('input')!.className).toContain(
      'text-[length:var(--mimi-command-input-font-size,15px)]',
    );
    expect(inline.querySelector('[role="listbox"]')!.className).toContain(
      'max-h-[var(--mimi-command-list-height,332px)]',
    );
    const option = options()[0];
    expect(option.className).toContain('h-[var(--mimi-command-item-height,40px)]');
    expect(option.className).toContain(
      'rounded-[var(--mimi-command-item-radius,var(--mimi-radius-sm))]',
    );
    expect(option.className).toContain(
      'data-[active=true]:bg-[color:var(--mimi-command-active,var(--mimi-accent))]',
    );
    host.extra.set('rounded-none shadow-none');
    await settle(fixture);
    expect(inline.className).toContain('rounded-none');
    expect(inline.className).not.toContain('rounded-[var(--mimi-radius-card)]');
    expect(inline.className).not.toContain('shadow-[shadow:var(--mimi-shadow-popover)]');
  });

  it('textos en español con provideMimiCommandText', async () => {
    TestBed.configureTestingModule({ providers: [provideMimiCommandText(MIMI_COMMAND_TEXT_ES)] });
    const { root, inline, type } = await setup();
    const loose = root.querySelector('[data-test="loose"]')!;
    expect(loose.querySelector('input')!.getAttribute('placeholder')).toBe(
      'Escribe un comando o busca…',
    );
    expect(loose.querySelector('input')!.getAttribute('aria-label')).toBe('Paleta de comandos');
    expect(inline.querySelector('[data-slot="footer"]')!.textContent).toContain('Navegar');
    await type('zzz');
    expect(inline.querySelector('[data-slot="empty"]')!.textContent).toContain(
      'Sin resultados para «zzz»',
    );
  });

  it('diálogo: Ctrl+K y ⌘K abren y cierran; foco en el buscador; Escape cierra', async () => {
    const { root, host, container, press, fixture } = await setup();
    const opener = root.querySelector<HTMLElement>('[data-test="opener"]')!;
    opener.focus();
    const shortcut = await press(document.body, 'k', { ctrlKey: true });
    expect(shortcut.defaultPrevented).toBe(true);
    expect(host.open()).toBe(true);
    const dialog = container()!;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBe('Command palette');
    const field = dialog.querySelector('input')!;
    expect(document.activeElement).toBe(field);
    expect(dialog.querySelector('[data-slot="esc"]')).not.toBeNull();
    expect(dialog.querySelector('[data-slot="close"]')).toBeNull();
    expect(dialog.querySelector('[data-test="dialog-icon"]')).not.toBeNull();
    const panel = dialog.querySelector<HTMLElement>('[data-mimi-overlay-panel]')!;
    expect(panel.className).toContain('top-[var(--mimi-command-top,36px)]');
    expect(panel.style.width).toBe('var(--mimi-command-width, 560px)');

    await press(field, 'Escape');
    await settle(fixture);
    expect(host.open()).toBe(false);
    await vi.waitFor(() => expect(container()).toBeNull());
    expect(document.activeElement).toBe(opener);

    await press(document.body, 'k', { metaKey: true });
    expect(host.open()).toBe(true);
    await press(document.body, 'k', { metaKey: true });
    expect(host.open()).toBe(false);
    // Sin ⌘ ni Ctrl, o con Mayús, no hace nada.
    await press(document.body, 'k');
    await press(document.body, 'k', { ctrlKey: true, shiftKey: true });
    expect(host.open()).toBe(false);
  });

  it('diálogo: ejecutar cierra y emite run', async () => {
    const { host, container, press, fixture, type } = await setup();
    host.open.set(true);
    await settle(fixture);
    const dialog = container()!;
    await type('cerrar', dialog);
    await press(dialog.querySelector('input')!, 'Enter');
    expect(host.dialogRan.map((i) => i.id)).toEqual(['logout']);
    expect(host.open()).toBe(false);
  });

  it('regresión NG0103: el ícono y el filtro no repiten la detección de cambios sin fin', async () => {
    const errors = vi.spyOn(console, 'error');
    const { type, press, input, host, fixture } = await setup();
    await type('ir');
    await press(input(), 'ArrowDown');
    host.extra.set('max-w-md');
    await settle(fixture);
    await type('');
    // Angular lo registra como console.error('ERROR', error): se miran todos los argumentos.
    const ng0103 = errors.mock.calls.filter((args) =>
      args.map(String).join(' ').includes('NG0103'),
    );
    expect(ng0103).toEqual([]);
    errors.mockRestore();
  });
});
