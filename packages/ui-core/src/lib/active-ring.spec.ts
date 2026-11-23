import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCommandImports } from '@/components/ui/command';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';
import { MimiMenuItemsImports } from '@/components/ui/menu';
import { MimiSelectImports } from '@/components/ui/select';
import { MimiTreeImports } from '@/components/ui/tree';

/**
 * La opción o el ítem activo con el teclado (22/11/2026, pedido del usuario): además del fondo
 * suave del hover (1,1:1 a 1,2:1 frente al panel), un anillo interior con el color del foco
 * (`--mimi-ring`, ≥ 3:1: `theme/contrast.spec.ts`). Solo con el teclado: con el puntero, el hover
 * sigue siendo solo el fondo.
 *
 * - Listas con `aria-activedescendant` (Select, Combobox, Command, por `option-list`): la lista
 *   lleva `data-nav="keyboard" | "pointer"` y la opción, `in-data-[nav=keyboard]:data-[active=true]:`.
 * - Foco itinerante (Dropdown Menu, Context Menu y sus submenús, por `menu`; Tree): el ítem recibe
 *   el foco y lleva `focus-visible:`.
 */
const RING = 'shadow-[shadow:inset_0_0_0_2px_var(--mimi-ring)]';

@Component({
  imports: [MimiSelectImports, MimiComboboxImports, MimiCommandImports],
  template: `
    <mimi-select aria-label="Talla">
      <mimi-option value="s">S</mimi-option>
      <mimi-option value="m">M</mimi-option>
    </mimi-select>
    <mimi-combobox aria-label="Fruta">
      <mimi-option value="pera">Pera</mimi-option>
      <mimi-option value="uva">Uva</mimi-option>
    </mimi-combobox>
    <mimi-command aria-label="Comandos" [items]="items" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ListsHost {
  readonly items = [
    { id: 'open', label: 'Abrir' },
    { id: 'save', label: 'Guardar' },
  ];
}

@Component({
  imports: [MimiDropdownMenuImports, MimiMenuItemsImports, MimiTreeImports],
  template: `
    <mimi-dropdown-menu>
      <button mimiDropdownMenuTrigger>Opciones</button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-item>Editar</mimi-menu-item>
        <mimi-menu-item tone="danger">Borrar</mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>
    <mimi-tree aria-label="Archivos" [nodes]="nodes" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RovingHost {
  readonly nodes = [{ id: 'a', label: 'a.ts' }];
}

const frame = () => new Promise((r) => setTimeout(r, 0));
const key = (target: EventTarget, k: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

describe('La opción activa con el teclado lleva un anillo del color del foco', () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
  });
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('Select: con el teclado, data-nav="keyboard" y la opción con el anillo; con el puntero, no', async () => {
    const fixture = TestBed.createComponent(ListsHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'mimi-select [role="combobox"]',
    )!;
    trigger.focus();
    key(trigger, 'ArrowDown');
    await fixture.whenStable();
    await frame();
    await fixture.whenStable();
    const listbox = document.querySelector<HTMLElement>('.cdk-overlay-pane [role="listbox"]')!;
    expect(listbox.dataset['nav']).toBe('keyboard');
    const options = Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]'));
    for (const option of options)
      expect(option.className).toContain(`in-data-[nav=keyboard]:data-[active=true]:${RING}`);
    // Con el puntero sobre una opción, la lista pasa a «pointer»: sin anillo, solo el fondo.
    options[1].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    await fixture.whenStable();
    expect(listbox.dataset['nav']).toBe('pointer');
    // Una tecla vuelve a «keyboard».
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await fixture.whenStable();
    expect(listbox.dataset['nav']).toBe('keyboard');
    fixture.destroy();
  });

  it('Combobox y Command: sus opciones llevan el anillo y la lista su data-nav', async () => {
    const fixture = TestBed.createComponent(ListsHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    // Command (siempre abierto).
    const command = el.querySelector<HTMLElement>('mimi-command [role="listbox"]')!;
    expect(command.dataset['nav']).toMatch(/^(keyboard|pointer)$/);
    expect(command.querySelector('[role="option"]')!.className).toContain(RING);
    // Combobox, abierto escribiendo.
    const field = el.querySelector<HTMLInputElement>('mimi-combobox input')!;
    field.focus();
    key(field, 'ArrowDown');
    await fixture.whenStable();
    await frame();
    await fixture.whenStable();
    const listbox = document.querySelector<HTMLElement>('.cdk-overlay-pane [role="listbox"]')!;
    expect(listbox.dataset['nav']).toBe('keyboard');
    expect(listbox.querySelector('[role="option"]')!.className).toContain(RING);
    fixture.destroy();
  });

  it('Dropdown Menu (los dos tonos) y Tree: el ítem con focus-visible lleva el anillo', async () => {
    const fixture = TestBed.createComponent(RovingHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLElement>('[mimiDropdownMenuTrigger]')!.click();
    await fixture.whenStable();
    await frame();
    await fixture.whenStable();
    const items = Array.from(
      document.querySelectorAll<HTMLElement>('.cdk-overlay-pane [role="menuitem"]'),
    );
    expect(items.length).toBe(2);
    for (const item of items) {
      expect(item.className).toContain(`in-data-[nav=keyboard]:focus-visible:${RING}`);
    }
    // El panel: «pointer» al mover el puntero; una tecla, «keyboard».
    const menu = document.querySelector<HTMLElement>('.cdk-overlay-pane [role="menu"]')!;
    items[1].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    await fixture.whenStable();
    expect(menu.dataset['nav']).toBe('pointer');
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(menu.dataset['nav']).toBe('keyboard');
    const row = el.querySelector<HTMLElement>('mimi-tree [role="treeitem"]')!;
    expect(row.className).toMatch(
      /focus-visible:shadow-\[(shadow:)?inset_0_0_0_2px_var\(--mimi-ring\)\]/,
    );
    fixture.destroy();
  });
});
