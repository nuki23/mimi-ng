import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { PaginationPage } from './pagination-page';

describe('PaginationPage', () => {
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
    const fixture = TestBed.createComponent(PaginationPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(6);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-pagination[role="navigation"] input')).not.toBeNull();
      expect(code).toContain("from '@/components/ui/pagination';");
      expect(code).toMatch(/export class Pagination\w+Example/);
    }
    // Los textos en español de la página.
    expect(el.querySelector('mimi-pagination')!.getAttribute('aria-label')).toBe('Paginación');
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
