import { TestBed } from '@angular/core/testing';
import { HighlighterService } from './highlighter.service';
import { InstallCommand } from './install-command';

describe('InstallCommand', () => {
  it('arma los dos comandos con el nombre del componente y cambia de pestaña', async () => {
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
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const tabs = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const panels = Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
    expect(tabs.map((t) => t.textContent?.trim())).toEqual(['pnpm', 'Angular CLI']);
    expect(panels.map((p) => p.querySelector('pre')?.textContent)).toEqual([
      'pnpm mimi add card',
      'ng g @mimi-ng/cli:ui card',
    ]);
    expect(panels[1].hidden).toBe(true);

    tabs[1].click();
    await fixture.whenStable();
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
  });
});
