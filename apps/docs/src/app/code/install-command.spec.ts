import { TestBed } from '@angular/core/testing';
import { settle } from './code-preview.testing';
import { HighlighterService } from './highlighter.service';
import { InstallCommand } from './install-command';

describe('InstallCommand', () => {
  it('arma los dos comandos de ng g con el nombre del componente y cambia de pestaña', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(InstallCommand);
    fixture.componentRef.setInput('name', 'card');
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe(
      'Forma de instalar',
    );
    const tabs = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    expect(tabs.map((t) => t.textContent?.trim())).toEqual(['Angular CLI', 'Forma larga']);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].querySelector('pre')?.textContent).toBe('ng g mimi card');
    expect(panels[1].hidden).toBe(true);

    tabs[1].click();
    await settle(fixture);
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    expect(panels[1].querySelector('pre')?.textContent).toBe('ng g @mimi-ng/cli:ui card');
  });
});
