import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CodePreview } from './code-preview';
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

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    return { fixture, el, tabs, panels };
  }

  it('empieza en Preview, con el ejemplo visible y el código oculto', async () => {
    const { el, tabs, panels } = await setup();
    expect(el.querySelector('[role="tablist"]')).not.toBeNull();
    expect(tabs.map((t) => t.textContent?.trim())).toEqual(['Preview', 'Código']);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].tabIndex).toBe(0);
    expect(tabs[1].tabIndex).toBe(-1);
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(panels[0].querySelector('[data-test="demo"]')).not.toBeNull();
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(tabs[0].getAttribute('aria-controls')).toBe(panels[0].id);
  });

  it('cambia de pestaña con clic', async () => {
    const { fixture, tabs, panels } = await setup();
    tabs[1].click();
    await fixture.whenStable();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    expect(panels[1].textContent).toContain('export class Demo {}');
  });

  it('cambia de pestaña con las flechas y mueve el foco', async () => {
    const { fixture, tabs, panels } = await setup();
    tabs[0].focus();

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
    expect(panels[1].hidden).toBe(false);

    // Circular: desde la última, la flecha derecha vuelve a la primera.
    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hidden).toBe(false);

    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
  });
});
