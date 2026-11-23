import { ChangeDetectionStrategy, Component, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiContextMenuImports } from '@/components/ui/context-menu';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';
import { MimiMenuItemsImports } from '@/components/ui/menu';
import { MimiPopoverImports } from '@/components/ui/popover';
import { MimiSelectImports } from '@/components/ui/select';

/**
 * Cierre por el scroll (22/11/2026, error del usuario): con un panel abierto, al hacer scroll
 * hasta que el campo sale de la vista, el panel se cierra y el foco vuelve al campo **sin mover la
 * página** (`focus({ preventScroll: true })`). Antes, el `focus()` normal hacía volver la página
 * hasta el campo. jsdom no mide ni hace scroll: las cajas se fijan a mano y se mira con qué
 * opciones se llamó a `focus()`. El scroll real lo comprueba Playwright (informe de la tanda 2).
 */
type Box = { top: number; left: number; width: number; height: number };
function place(el: Element, box: Box): void {
  el.getBoundingClientRect = () =>
    ({
      ...box,
      right: box.left + box.width,
      bottom: box.top + box.height,
      x: box.left,
      y: box.top,
      toJSON: () => box,
    }) as DOMRect;
}
const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

const SCROLLER = 'data-test="scroller" style="overflow: auto; height: 300px"';

@Component({
  imports: [MimiSelectImports],
  template: `<div ${SCROLLER}>
    <mimi-select aria-label="Talla"><mimi-option value="m">M</mimi-option></mimi-select>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SelectHost {}

@Component({
  imports: [MimiPopoverImports],
  template: `<div ${SCROLLER}>
    <mimi-popover>
      <button mimiPopoverTrigger>Abrir</button>
      <ng-template mimiPopoverContent><button data-test="inside">Dentro</button></ng-template>
    </mimi-popover>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PopoverHost {}

@Component({
  imports: [MimiDropdownMenuImports, MimiMenuItemsImports],
  template: `<div ${SCROLLER}>
    <mimi-dropdown-menu>
      <button mimiDropdownMenuTrigger>Opciones</button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-item>Editar</mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DropdownHost {}

@Component({
  imports: [MimiContextMenuImports, MimiMenuItemsImports],
  template: `<div ${SCROLLER}>
    <mimi-context-menu aria-label="Menú">
      <div mimiContextMenuTrigger tabindex="0">Zona</div>
      <ng-template mimiContextMenuContent>
        <mimi-menu-item>Recargar</mimi-menu-item>
      </ng-template>
    </mimi-context-menu>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ContextHost {}

@Component({
  imports: [MimiComboboxImports],
  template: `<div ${SCROLLER}>
    <mimi-combobox aria-label="Fruta">
      <mimi-option value="pera">Pera</mimi-option>
      <mimi-option value="uva">Uva</mimi-option>
    </mimi-combobox>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ComboboxHost {}

interface Case {
  name: string;
  host: Type<unknown>;
  trigger: string;
  open: (trigger: HTMLElement) => void;
}

const cases: Case[] = [
  { name: 'Select', host: SelectHost, trigger: 'button[role="combobox"]', open: (t) => t.click() },
  { name: 'Popover', host: PopoverHost, trigger: '[mimiPopoverTrigger]', open: (t) => t.click() },
  {
    name: 'Dropdown Menu',
    host: DropdownHost,
    trigger: '[mimiDropdownMenuTrigger]',
    open: (t) => t.click(),
  },
  {
    name: 'Context Menu (Mayús+F10)',
    host: ContextHost,
    trigger: '[mimiContextMenuTrigger]',
    open: (t) => {
      t.focus();
      t.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true }));
      t.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    },
  },
];

describe('utils/overlay: al cerrar por el scroll, el foco vuelve sin mover la página', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  for (const c of cases) {
    it(`${c.name}: el foco estaba en el panel y vuelve al campo con preventScroll`, async () => {
      const fixture = TestBed.createComponent(c.host);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const scroller = el.querySelector<HTMLElement>('[data-test="scroller"]')!;
      const trigger = el.querySelector<HTMLElement>(c.trigger)!;
      place(scroller, { top: 0, left: 0, width: 400, height: 300 });
      // Todo lo de dentro del contenedor, a la vista (el origen puede ser un envoltorio).
      for (const node of Array.from(scroller.querySelectorAll('*'))) {
        place(node, { top: 20, left: 0, width: 200, height: 40 });
      }
      c.open(trigger);
      await fixture.whenStable();
      await frame();
      await fixture.whenStable();
      const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane');
      expect(pane, 'el panel se abrió').not.toBeNull();
      // El foco, dentro del panel (como al abrir con el teclado o al moverse por él).
      const inside =
        pane!.querySelector<HTMLElement>('button, [role="menuitem"], [role="option"]') ?? pane!;
      if (!inside.hasAttribute('tabindex') && inside.tagName !== 'BUTTON') inside.tabIndex = -1;
      inside.focus();
      expect(pane!.contains(document.activeElement)).toBe(true);

      const focus = vi.spyOn(HTMLElement.prototype, 'focus');
      // El campo sale por arriba del contenedor.
      for (const node of Array.from(scroller.querySelectorAll('*'))) {
        place(node, { top: -200, left: 0, width: 200, height: 40 });
      }
      scroller.dispatchEvent(new Event('scroll'));
      await frame();
      await fixture.whenStable();
      await frame();
      await fixture.whenStable();

      expect(document.activeElement).toBe(trigger);
      const onTrigger = focus.mock.contexts
        .map((context, i) => ({ context, options: focus.mock.calls[i][0] }))
        .filter(({ context }) => context === trigger);
      expect(onTrigger.length).toBeGreaterThan(0);
      // Ninguna llamada al campo sin preventScroll: esa es la que hacía saltar la página.
      for (const { options } of onTrigger) expect(options?.preventScroll).toBe(true);
      fixture.destroy();
    });
  }

  it('Combobox: el foco ya está en el campo y no se mueve', async () => {
    const fixture = TestBed.createComponent(ComboboxHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const scroller = el.querySelector<HTMLElement>('[data-test="scroller"]')!;
    const field = el.querySelector<HTMLInputElement>('mimi-combobox input')!;
    place(scroller, { top: 0, left: 0, width: 400, height: 300 });
    for (const node of Array.from(scroller.querySelectorAll('*'))) {
      place(node, { top: 20, left: 0, width: 200, height: 40 });
    }
    field.focus();
    field.click();
    await fixture.whenStable();
    await frame();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    for (const node of Array.from(scroller.querySelectorAll('*'))) {
      place(node, { top: -200, left: 0, width: 200, height: 40 });
    }
    scroller.dispatchEvent(new Event('scroll'));
    await frame();
    await fixture.whenStable();
    expect(document.activeElement).toBe(field);
    for (const options of focus.mock.calls.map((call) => call[0])) {
      expect(options?.preventScroll).toBe(true);
    }
    fixture.destroy();
  });
});
