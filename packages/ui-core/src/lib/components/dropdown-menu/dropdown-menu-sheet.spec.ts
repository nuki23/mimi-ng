import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiContextMenuImports } from '@/components/ui/context-menu';
import type { MimiOverlayPresentation } from '@/components/ui/utils/overlay-config';
import { MimiDropdownMenuImports } from './dropdown-menu';

// R.34: Dropdown y Context Menu en la hoja inferior en el teléfono (y con `presentation`).
@Component({
  imports: [MimiDropdownMenuImports, MimiContextMenuImports],
  template: `
    <mimi-dropdown-menu [presentation]="presentation()" [(open)]="open">
      <button data-test="trigger" mimiDropdownMenuTrigger>Acciones</button>
      <ng-template mimiDropdownMenuContent>
        <mimi-menu-item (selected)="picked.set('editar')">Editar</mimi-menu-item>
        <mimi-menu-item>Borrar</mimi-menu-item>
      </ng-template>
    </mimi-dropdown-menu>
    <mimi-context-menu aria-label="Archivo">
      <div data-test="area" mimiContextMenuTrigger>Zona</div>
      <ng-template mimiContextMenuContent>
        <mimi-menu-item>Copiar</mimi-menu-item>
      </ng-template>
    </mimi-context-menu>
  `,
})
class Host {
  readonly presentation = signal<MimiOverlayPresentation>('auto');
  readonly open = signal(false);
  readonly picked = signal('');
}

describe('Menús en la hoja (R.34)', () => {
  let narrow = false;
  const original = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: narrow && query === '(max-width: 639.98px)',
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
    narrow = false;
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      for (let i = 0; i < 2; i++) {
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve));
      }
    };
    await settle();
    return { host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement, settle };
  }

  const sheet = () => document.querySelector<HTMLElement>('[data-mimi-sheet]');

  it('en el teléfono, el dropdown abre en la hoja con el texto del trigger como título', async () => {
    narrow = true;
    const { host, el, settle } = await setup();
    el.querySelector<HTMLElement>('[data-test="trigger"]')!.click();
    await settle();
    expect(sheet()?.dataset['side']).toBe('bottom');
    expect(sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim()).toBe('Acciones');
    const menu = sheet()!.querySelector('[role="menu"]')!;
    expect(menu).not.toBeNull();
    expect(document.activeElement?.closest('[role="menu"]')).toBe(menu);
    // Elegir un ítem cierra la hoja.
    menu.querySelector<HTMLElement>('[role="menuitem"]')!.click();
    await settle();
    expect(host.picked()).toBe('editar');
    expect(host.open()).toBe(false);
    expect(sheet()).toBeNull();
  });

  it('en escritorio sigue siendo popover; presentation="sheet" lo pide siempre', async () => {
    const { host, el, settle } = await setup();
    el.querySelector<HTMLElement>('[data-test="trigger"]')!.click();
    await settle();
    expect(sheet()).toBeNull();
    host.open.set(false);
    await settle();
    host.presentation.set('sheet');
    await settle();
    el.querySelector<HTMLElement>('[data-test="trigger"]')!.click();
    await settle();
    expect(sheet()).not.toBeNull();
  });

  it('Context Menu en el teléfono: la hoja inferior, no el punto', async () => {
    narrow = true;
    const { el, settle } = await setup();
    el.querySelector<HTMLElement>('[data-test="area"]')!.dispatchEvent(
      new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }),
    );
    await settle();
    expect(sheet()?.dataset['side']).toBe('bottom');
    expect(sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim()).toBe('Archivo');
    expect(sheet()!.querySelector('[role="menu"]')).not.toBeNull();
  });
});
