import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HighlighterService } from '../../../../code/highlighter.service';
import { InputPage } from './input-page';

describe('InputPage', () => {
  it('cada ejemplo corre en Preview y su pestaña Código muestra el archivo real', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(InputPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(11);
    for (const preview of previews) {
      expect(preview.querySelector('[mimiInput], [mimiTextarea]')).not.toBeNull();
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      // Las importaciones son las del proyecto del usuario, no las del monorepo.
      expect(code).toMatch(/from '@\/components\/ui\/(input|textarea)';/);
      expect(code).not.toContain('@mimi-ng/ui-core');
    }
    expect(el.querySelectorAll('app-install-command').length).toBe(2);
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'forms',
      'api',
    ]);
  });
});
