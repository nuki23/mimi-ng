import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiDropdownMenuImports } from './dropdown-menu';

@Component({
  imports: [MimiDropdownMenuImports],
  template: `
    <button data-test="before">Antes</button>
    <mimi-dropdown-menu [(open)]="open" [class]="extra()" [aria-label]="label()">
      <button data-test="trigger" mimiDropdownMenuTrigger>Proyecto</button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-label>Proyecto</mimi-menu-label>
        <mimi-menu-item shortcut="⌘," (selected)="picked.set('ajustes')" [class]="itemClass()">
          <svg data-test="icon"></svg>
          Ajustes
        </mimi-menu-item>
        <mimi-menu-item [disabled]="true" (selected)="picked.set('facturacion')">
          Facturación
        </mimi-menu-item>
        <mimi-menu-separator />
        <mimi-menu-checkbox-item [(checked)]="sidebar">Barra lateral</mimi-menu-checkbox-item>
        <mimi-menu-radio-group [(value)]="order" aria-label="Orden">
          <mimi-menu-radio-item value="name">Nombre</mimi-menu-radio-item>
          <mimi-menu-radio-item value="date">Fecha</mimi-menu-radio-item>
        </mimi-menu-radio-group>
        <mimi-menu-sub>
          <mimi-menu-sub-trigger>Invitar personas</mimi-menu-sub-trigger>
          <ng-template mimiMenuSubContent>
            <mimi-menu-item (selected)="picked.set('correo')">Por correo</mimi-menu-item>
            <mimi-menu-checkbox-item [(checked)]="notify">Avisar</mimi-menu-checkbox-item>
          </ng-template>
        </mimi-menu-sub>
        <mimi-menu-separator />
        <mimi-menu-item tone="danger" (selected)="picked.set('eliminar')">Eliminar</mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>
    <button data-test="after">Después</button>
  `,
})
class Host {
  readonly open = signal(false);
  readonly extra = signal('');
  readonly label = signal('');
  readonly itemClass = signal('');
  readonly picked = signal<string | null>(null);
  readonly sidebar = signal(true);
  readonly notify = signal(false);
  readonly order = signal<string>('name');
}

/** El cierre espera la animación (en jsdom no hay) en una microtarea después del render. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

const key = (target: Element, k: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('MimiDropdownMenu', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    await settle(fixture);
    const trigger = root.querySelector<HTMLButtonElement>('[data-test=trigger]')!;
    const menu = () => document.querySelector<HTMLElement>('[data-mimi-overlay-panel][role=menu]');
    const item = (text: string) =>
      Array.from(document.querySelectorAll<HTMLElement>('[role^=menuitem]')).find((el) =>
        el.textContent?.trim().startsWith(text),
      )!;
    const focused = () => document.activeElement?.textContent?.trim() ?? '';
    const press = async (k: string) => {
      key(document.activeElement!, k);
      await settle(fixture);
    };
    const open = async () => {
      trigger.click();
      await settle(fixture);
    };
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      trigger,
      menu,
      item,
      focused,
      press,
      open,
    };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => c.remove());
    document.body.innerHTML = '';
  });

  it('cerrado: el trigger lleva aria-haspopup="menu", aria-expanded e id, sin menú', async () => {
    const { trigger, menu } = await setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    expect(trigger.id).toMatch(/^mimi-dropdown-menu-\d+-trigger$/);
    expect(menu()).toBeNull();
  });

  it('el clic abre: role="menu" nombrado por el trigger, aria-controls y el foco en el primer ítem', async () => {
    const { trigger, menu, focused, open, host } = await setup();
    await open();
    expect(host.open()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(menu()!.id);
    expect(menu()!.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(menu()!.dataset['state']).toBe('open');
    expect(focused()).toContain('Ajustes');
  });

  // Alarma: el foco inicial depende de enviar Home/End al ngMenu (aria no tiene un método público).
  // Si aria cambia su teclado, esta prueba falla.
  it('foco al abrir: ↓ en el trigger va al primer ítem y ↑ al último', async () => {
    const { fixture, trigger, focused, host } = await setup();
    trigger.focus();
    key(trigger, 'ArrowUp');
    await settle(fixture);
    expect(host.open()).toBe(true);
    expect(focused()).toBe('Eliminar');
    expect(document.activeElement!.getAttribute('data-active')).toBe('true');
    host.open.set(false);
    await settle(fixture);
    key(trigger, 'ArrowDown');
    await settle(fixture);
    expect(focused()).toContain('Ajustes');
  });

  it('flechas, Home/End y typeahead (por el texto, sin el atajo)', async () => {
    const { open, press, focused } = await setup();
    await open();
    await press('ArrowDown');
    expect(focused()).toBe('Facturación'); // deshabilitado: recibe el foco (patrón de menú)
    await press('End');
    expect(focused()).toBe('Eliminar');
    await press('ArrowDown');
    expect(focused()).toContain('Ajustes'); // vuelve al inicio
    await press('b');
    expect(focused()).toBe('Barra lateral');
  });

  it('Enter en un ítem lo elige, cierra y devuelve el foco al trigger', async () => {
    const { open, press, host, trigger, menu } = await setup();
    await open();
    await press('Enter');
    expect(host.picked()).toBe('ajustes');
    expect(host.open()).toBe(false);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('el clic elige; un ítem deshabilitado no hace nada', async () => {
    const { open, item, host } = await setup();
    await open();
    item('Facturación').click();
    expect(host.picked()).toBeNull();
    expect(host.open()).toBe(true);
    item('Eliminar').click();
    expect(host.picked()).toBe('eliminar');
    expect(host.open()).toBe(false);
  });

  it('Escape cierra y devuelve el foco al trigger', async () => {
    const { open, press, host, trigger } = await setup();
    await open();
    await press('Escape');
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('clic fuera y Tab cierran sin mover el foco al trigger', async () => {
    const { fixture, root, open, host, trigger } = await setup();
    await open();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle(fixture);
    expect(host.open()).toBe(false);

    await open();
    const after = root.querySelector<HTMLElement>('[data-test=after]')!;
    after.focus();
    await settle(fixture);
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(after);
    expect(document.activeElement).not.toBe(trigger);
  });

  it('checkbox: role, aria-checked y data-state; al marcarlo cambia [(checked)] y cierra', async () => {
    const { open, item, host } = await setup();
    await open();
    const checkbox = item('Barra lateral');
    expect(checkbox.getAttribute('role')).toBe('menuitemcheckbox');
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(checkbox.dataset['state']).toBe('checked');
    expect(checkbox.querySelector('svg')).not.toBeNull();
    checkbox.click();
    expect(host.sidebar()).toBe(false);
    expect(host.open()).toBe(false);
  });

  it('radio: grupo con nombre, menuitemradio con aria-checked; elegir cambia [(value)] y cierra', async () => {
    const { open, item, host } = await setup();
    await open();
    const group = document.querySelector('mimi-menu-radio-group')!;
    expect(group.getAttribute('role')).toBe('group');
    expect(group.getAttribute('aria-label')).toBe('Orden');
    expect(item('Nombre').getAttribute('role')).toBe('menuitemradio');
    expect(item('Nombre').getAttribute('aria-checked')).toBe('true');
    expect(item('Fecha').getAttribute('aria-checked')).toBe('false');
    item('Fecha').click();
    expect(host.order()).toBe('date');
    expect(host.open()).toBe(false);
  });

  it('submenú: → lo abre en su primer ítem, ← lo cierra y el foco vuelve a su ítem', async () => {
    const { fixture, open, press, focused, item } = await setup();
    await open();
    await press('i'); // typeahead hasta «Invitar personas»
    expect(focused()).toBe('Invitar personas');
    const sub = item('Invitar personas');
    expect(sub.getAttribute('aria-haspopup')).toBe('true');
    expect(sub.getAttribute('aria-expanded')).toBe('false');
    await press('ArrowRight');
    expect(sub.getAttribute('aria-expanded')).toBe('true');
    expect(focused()).toBe('Por correo');
    const panel = document.getElementById(sub.getAttribute('aria-controls')!)!;
    expect(panel.hidden).toBe(false);
    expect(panel.getAttribute('aria-labelledby')).toBe(sub.id);
    await press('ArrowLeft');
    await settle(fixture);
    expect(sub.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
    expect(focused()).toBe('Invitar personas');
  });

  it('submenú: a la derecha; si no cabe, a la izquierda, y sube si sale por abajo', async () => {
    const { open, press, item } = await setup();
    await open();
    await press('i');
    const sub = item('Invitar personas');
    const panel = document.getElementById(sub.getAttribute('aria-controls')!)!;
    expect(panel.dataset['side']).toBe('right');
    const rect = vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: window.innerHeight + 20,
      left: window.innerWidth - 100,
      right: window.innerWidth + 100,
      width: 200,
      height: 200,
    } as DOMRect);
    await press('ArrowRight');
    expect(panel.dataset['side']).toBe('left');
    expect(panel.style.translate).toBe('0 -28px'); // 20px fuera + 8px de margen
    rect.mockRestore();
  });

  it('Escape en un submenú cierra solo el submenú; el siguiente Escape cierra el menú', async () => {
    const { open, press, focused, host } = await setup();
    await open();
    await press('i');
    await press('Enter');
    expect(focused()).toBe('Por correo');
    await press('Escape');
    expect(host.open()).toBe(true);
    expect(focused()).toBe('Invitar personas');
    await press('Escape');
    expect(host.open()).toBe(false);
  });

  it('elegir en un submenú (ítem o checkbox) cierra todo el menú', async () => {
    const { fixture, open, press, item, host, trigger } = await setup();
    await open();
    await press('i');
    await press('ArrowRight');
    item('Por correo').click();
    await settle(fixture);
    expect(host.picked()).toBe('correo');
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(trigger);

    await open();
    await press('i');
    await press('ArrowRight');
    item('Avisar').click();
    expect(host.notify()).toBe(true);
    expect(host.open()).toBe(false);
  });

  it('data-*: tone, disabled y el estado del ítem activo', async () => {
    const { open, item } = await setup();
    await open();
    expect(item('Eliminar').dataset['tone']).toBe('danger');
    expect(item('Facturación').hasAttribute('data-disabled')).toBe(true);
    expect(item('Facturación').getAttribute('aria-disabled')).toBe('true');
    expect(item('Ajustes').getAttribute('data-active')).toBe('true');
  });

  it('ítem: el svg va a la columna de ícono y el atajo a la derecha', async () => {
    const { open, item } = await setup();
    await open();
    const ajustes = item('Ajustes');
    const [icon, label, shortcut] = Array.from(ajustes.children);
    expect(icon.querySelector('[data-test=icon]')).not.toBeNull();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(label.textContent?.trim()).toBe('Ajustes');
    expect(shortcut.textContent).toBe('⌘,');
    expect(shortcut.className).toContain('font-mono');
  });

  it('etiqueta y separador', async () => {
    const { open, menu } = await setup();
    await open();
    expect(menu()!.querySelector('mimi-menu-label')!.getAttribute('role')).toBe('presentation');
    expect(menu()!.querySelectorAll('[role=separator]').length).toBe(2);
  });

  it('aria-label="…" nombra el menú', async () => {
    const { fixture, open, menu, host } = await setup();
    host.label.set('Opciones del proyecto');
    await settle(fixture);
    await open();
    expect(menu()!.getAttribute('aria-label')).toBe('Opciones del proyecto');
    expect(menu()!.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('class del usuario: en <mimi-dropdown-menu> va al panel; en un ítem, al ítem (gana con cn)', async () => {
    const { fixture, root, open, menu, item, host } = await setup();
    host.extra.set('w-80 p-2');
    host.itemClass.set('h-10 rounded-none');
    await settle(fixture);
    await open();
    expect(menu()!.className).toContain('w-80');
    expect(menu()!.className).not.toContain('w-[var(--mimi-menu-width,240px)]');
    expect(menu()!.className).not.toContain(' p-1 ');
    expect(root.querySelector('mimi-dropdown-menu')!.hasAttribute('class')).toBe(false);
    const ajustes = item('Ajustes');
    expect(ajustes.className).toContain('h-10');
    expect(ajustes.className).not.toContain('h-[var(--mimi-menu-item-height,32px)]');
    expect(ajustes.className).toContain('rounded-none');
  });

  it('[(open)] desde fuera abre y cierra', async () => {
    const { fixture, menu, host } = await setup();
    host.open.set(true);
    await settle(fixture);
    expect(menu()).not.toBeNull();
    host.open.set(false);
    await settle(fixture);
    expect(menu()).toBeNull();
  });

  it('al cerrar se destruye el contenido: al reabrir, el foco vuelve al primer ítem', async () => {
    const { open, press, focused, host, fixture } = await setup();
    await open();
    await press('End');
    host.open.set(false);
    await settle(fixture);
    await open();
    expect(focused()).toContain('Ajustes');
  });
});
