import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CodePreview } from './code-preview';
import { settle } from './code-preview.testing';
import { HighlighterService } from './highlighter.service';

@Component({
  imports: [CodePreview],
  template: `<app-code-preview [code]="code"
    ><p data-test="demo">Ejemplo en vivo</p></app-code-preview
  >`,
})
class Host {
  code = 'export class Demo {}';
}

/** Resaltador que nunca termina: las pruebas no cargan Shiki. */
const pendingHighlighter = { highlight: () => new Promise(() => undefined) };

describe('CodePreview', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HighlighterService, useValue: pendingHighlighter }],
    });
  });
  // El foco que queda en una pestaña afecta al :focus-visible de otras pruebas.
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    return { fixture, el, tabs, panels };
  }

  it('empieza en Preview, con el ejemplo visible y el código sin crear', async () => {
    const { el, tabs, panels } = await setup();
    expect(el.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe(
      'Vista del ejemplo',
    );
    expect(tabs.map((t) => t.textContent?.trim())).toEqual(['Preview', 'Código']);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].tabIndex).toBe(0);
    expect(tabs[1].tabIndex).toBe(-1);
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(panels[0].querySelector('[data-test="demo"]')).not.toBeNull();
    expect(panels[1].querySelector('pre')).toBeNull();
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(tabs[0].getAttribute('aria-controls')).toBe(panels[0].id);
  });

  it('Copiar va antes de las pestañas en el orden de Tab', async () => {
    const { el } = await setup();
    const copy = el.querySelector('app-copy-button button')!;
    const tablist = el.querySelector('[role="tablist"]')!;
    expect(copy.textContent?.trim()).toBe('Copiar');
    expect(copy.compareDocumentPosition(tablist) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('cambia de pestaña con clic y conserva el ejemplo al volver', async () => {
    const { fixture, tabs, panels } = await setup();
    const demo = panels[0].querySelector('[data-test="demo"]');

    tabs[1].click();
    await settle(fixture);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    expect(panels[1].querySelector('pre')?.textContent).toContain('export class Demo {}');

    tabs[0].click();
    await settle(fixture);
    expect(panels[0].hidden).toBe(false);
    expect(panels[0].querySelector('[data-test="demo"]')).toBe(demo);
  });

  it('resalta el código por adelantado, sin esperar a que se abra la pestaña Código', async () => {
    const highlight = vi.spyOn(pendingHighlighter, 'highlight');
    const { panels } = await setup();
    expect(panels[1].querySelector('pre')).toBeNull();
    // Sin requestIdleCallback (jsdom), con un setTimeout de 200 ms.
    await new Promise((r) => setTimeout(r, 250));
    expect(highlight).toHaveBeenCalledWith('export class Demo {}', 'angular-ts');
    highlight.mockRestore();
  });

  it('cambia de pestaña con las flechas y mueve el foco', async () => {
    const { fixture, tabs, panels } = await setup();
    tabs[0].focus();

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await settle(fixture);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
    expect(panels[1].hidden).toBe(false);

    // Circular: desde la última, la flecha derecha vuelve a la primera.
    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await settle(fixture);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hidden).toBe(false);

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await settle(fixture);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
  });
});
