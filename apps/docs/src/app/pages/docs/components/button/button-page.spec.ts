import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ButtonPage } from './button-page';

describe('ButtonPage', () => {
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
    const fixture = TestBed.createComponent(ButtonPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(8);
    for (const { example, code } of previews) {
      expect(example?.querySelector('[mimiBtn]')).not.toBeNull();
      // La importación es la del proyecto del usuario, no la del monorepo.
      expect(code).toContain("import { MimiButton } from '@/components/ui/button';");
      expect(code).toMatch(/export class Button\w+Example/);
    }
    expect(el.querySelector('app-install-command')).not.toBeNull();
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
