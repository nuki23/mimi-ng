import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { DropdownMenuPage } from './dropdown-menu-page';

describe('DropdownMenuPage', () => {
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
    const fixture = TestBed.createComponent(DropdownMenuPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(5);
    for (const { example, code } of previews) {
      expect(
        example?.querySelector('[mimiDropdownMenuTrigger][aria-haspopup=menu]'),
      ).not.toBeNull();
      expect(code).toContain("from '@/components/ui/dropdown-menu';");
      expect(code).toMatch(/export class DropdownMenu\w+Example/);
    }
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
