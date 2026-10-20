import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ToolbarPage } from './toolbar-page';

describe('ToolbarPage', () => {
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
    const fixture = TestBed.createComponent(ToolbarPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(5);
    for (const { example, code } of previews) {
      expect(
        example?.querySelector('mimi-toolbar[role="toolbar"] [mimiToolbarItem]'),
      ).not.toBeNull();
      expect(code).toContain("from '@/components/ui/toolbar';");
      expect(code).toMatch(/export class Toolbar\w+Example/);
    }
    // Todos los botones tienen nombre (los de solo ícono, por aria-label).
    for (const button of Array.from(el.querySelectorAll('[mimiToolbarItem]'))) {
      expect(button.getAttribute('aria-label'), button.outerHTML).toBeTruthy();
    }
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
