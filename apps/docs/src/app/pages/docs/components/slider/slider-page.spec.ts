import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SliderPage } from './slider-page';

describe('SliderPage', () => {
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
    const fixture = TestBed.createComponent(SliderPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(3);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-slider [role="slider"]')).not.toBeNull();
      expect(code).toContain("from '@/components/ui/slider';");
      expect(code).toMatch(/export class Slider\w+Example/);
    }
    // Todos los pulgares tienen nombre (aria-label o la etiqueta).
    for (const thumb of Array.from(el.querySelectorAll('[role="slider"]'))) {
      const named = thumb.getAttribute('aria-label') || thumb.getAttribute('aria-labelledby');
      expect(named, thumb.outerHTML.slice(0, 80)).toBeTruthy();
    }
    // En español: «Precio por noche, Mínimo».
    expect(
      el.querySelector('app-slider-range-example [role="slider"]')!.getAttribute('aria-label'),
    ).toBe('Precio por noche, Mínimo');
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
