import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { TagsInputPage } from './tags-input-page';

describe('TagsInputPage', () => {
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
    const fixture = TestBed.createComponent(TagsInputPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(3);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-tags-input input')).not.toBeNull();
      expect(code).toContain("from '@/components/ui/tags-input';");
      expect(code).toMatch(/export class TagsInput\w+Example/);
    }
    for (const input of Array.from(
      el.querySelectorAll<HTMLInputElement>('mimi-tags-input input'),
    )) {
      const named =
        input.getAttribute('aria-label') ||
        (input.id && el.querySelector(`label[for="${input.id}"]`));
      expect(named, input.outerHTML).toBeTruthy();
    }
    // Los textos, en español.
    expect(el.querySelector('[data-slot="remove"]')!.getAttribute('aria-label')).toBe(
      'Quitar angular',
    );
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
