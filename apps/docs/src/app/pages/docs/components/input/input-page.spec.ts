import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
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
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(11);
    for (const { example, code } of previews) {
      expect(example?.querySelector('[mimiInput], [mimiTextarea]')).not.toBeNull();
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
