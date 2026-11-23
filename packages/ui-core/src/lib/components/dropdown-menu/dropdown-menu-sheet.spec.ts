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
        <mimi-menu-sub>
          <mimi-menu-sub-trigger>Invitar</mimi-menu-sub-trigger>
          <ng-template mimiMenuSubContent>
            <mimi-menu-item>Por correo</mimi-menu-item>
          </ng-template>
        </mimi-menu-sub>
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
    // Objetivos táctiles de 44 px en la hoja (revisión de accesibilidad H5).
    expect(menu.className).toContain('[&_[role^=menuitem]]:min-h-11');
    expect(document.activeElement?.closest('[role="menu"]')).toBe(menu);
    // Elegir un ítem cierra la hoja.
    menu.querySelector<HTMLElement>('[role="menuitem"]')!.click();
    await settle();
    expect(host.picked()).toBe('editar');
    expect(host.open()).toBe(false);
    expect(sheet()).toBeNull();
  });

  it('Tab desde el menú se queda en la hoja (va a la X) y no la cierra (a11y H2)', async () => {
    narrow = true;
    const { host, el, settle } = await setup();
    el.querySelector<HTMLElement>('[data-test="trigger"]')!.click();
    await settle();
    const item = sheet()!.querySelector<HTMLElement>('[role="menuitem"]')!;
    const close = sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!;
    item.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: close }));
    close.focus();
    await settle();
    expect(host.open()).toBe(true);
    expect(sheet()!.dataset['state']).toBe('open');
  });

  it('Tab hacia el ancla de la trampa de foco del CDK (fuera del marco) tampoco cierra', async () => {
    narrow = true;
    const { host, el, settle } = await setup();
    el.querySelector<HTMLElement>('[data-test="trigger"]')!.click();
    await settle();
    const item = sheet()!.querySelector<HTMLElement>('[role="menuitem"]')!;
    const anchor = sheet()!
      .closest('.mimi-sheet-pane')!
      .querySelector<HTMLElement>('.cdk-focus-trap-anchor')!;
    expect(anchor).not.toBeNull();
    expect(sheet()!.contains(anchor)).toBe(false);
    item.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: anchor }));
    await settle();
    expect(host.open()).toBe(true);
    expect(sheet()!.dataset['state']).toBe('open');
  });

  it('el panel de un submenú en la hoja va dentro de ella, no al lado (a11y H1)', async () => {
    narrow = true;
    const { el, settle } = await setup();
    el.querySelector<HTMLElement>('[data-test="trigger"]')!.click();
    await settle();
    const sub = sheet()!.querySelector('mimi-menu-sub')!;
    const panel = sub.querySelector<HTMLElement>('[ngmenu], [role="menu"]')!;
    expect(panel.hasAttribute('data-in-sheet')).toBe(true);
    expect(panel.classList).toContain('static');
    expect(panel.classList).not.toContain('absolute');
  });

  it('un submenú en la hoja es un nivel aparte con «Atrás», con anuncio (R.34)', async () => {
    narrow = true;
    const { host, el, settle } = await setup();
    el.querySelector<HTMLElement>('[data-test="trigger"]')!.click();
    await settle();
    const title = () => sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim();
    const back = () => sheet()!.querySelector<HTMLElement>('[data-slot="back"]');
    const announce = () => sheet()!.querySelector('[data-slot="announce"]')!;
    expect(back()).toBeNull();
    expect(announce().getAttribute('aria-live')).toBe('polite');
    const sub = sheet()!.querySelector<HTMLElement>('mimi-menu-sub')!;
    const subTrigger = sub.querySelector<HTMLElement>('[role="menuitem"]')!;
    subTrigger.click();
    await settle();
    // El nivel: «Atrás», el título del submenú, el anuncio y el foco en su primer ítem.
    expect(back()).not.toBeNull();
    expect(title()).toBe('Invitar');
    expect(announce().textContent?.trim()).toBe('Invitar');
    const root = sheet()!.querySelector<HTMLElement>('[role="menu"]')!;
    expect(root.hasAttribute('data-sheet-level')).toBe(true);
    expect(sub.hasAttribute('data-level-open')).toBe(true);
    // Lo demás del nivel de arriba se esconde (y el ítem del submenú también).
    expect(root.className).toContain('[&[data-sheet-level]>:not([data-level-open])]:hidden!');
    expect(subTrigger.classList).toContain('hidden!');
    expect(document.activeElement?.textContent?.trim()).toBe('Por correo');
    // El foco que pasa a la cabecera (Tab a «Atrás» o a la X) no cierra el nivel (a11y H4).
    const level = document.activeElement as HTMLElement;
    level.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: back() }));
    back()!.focus();
    await settle();
    expect(title()).toBe('Invitar');
    expect(back()).not.toBeNull();
    // «Atrás» vuelve: el título del menú, el anuncio y el foco en el ítem del submenú.
    back()!.click();
    await settle();
    expect(back()).toBeNull();
    expect(title()).toBe('Acciones');
    expect(announce().textContent?.trim()).toBe('Acciones');
    expect(root.hasAttribute('data-sheet-level')).toBe(false);
    expect(sub.hasAttribute('data-level-open')).toBe(false);
    expect(document.activeElement).toBe(subTrigger);
    expect(host.open()).toBe(true);
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
