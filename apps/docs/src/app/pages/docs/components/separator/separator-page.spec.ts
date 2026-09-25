import { TestBed } from '@angular/core/testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SeparatorPage } from './separator-page';

describe('SeparatorPage', () => {
  it('cada ejemplo corre en Preview y su pestaña Código muestra el archivo real', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(SeparatorPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(4);
    for (const preview of previews) {
      expect(preview.querySelector('mimi-separator')).not.toBeNull();
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      expect(code).toContain("import { MimiSeparator } from '@/components/ui/separator';");
      expect(code).toMatch(/export class Separator\w+Example/);
    }
    // Solo el ejemplo semántico se anuncia.
    expect(el.querySelectorAll('mimi-separator[role="separator"]').length).toBe(1);
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
