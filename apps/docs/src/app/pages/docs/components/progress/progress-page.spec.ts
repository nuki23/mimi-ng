import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ProgressPage } from './progress-page';

describe('ProgressPage', () => {
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
    const fixture = TestBed.createComponent(ProgressPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(5);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-progress[role="progressbar"]')).not.toBeNull();
      expect(code).toContain("from '@/components/ui/progress';");
      expect(code).toMatch(/export class Progress\w+Example/);
    }
    // Todas tienen nombre.
    for (const bar of Array.from(el.querySelectorAll('mimi-progress'))) {
      const name = bar.getAttribute('aria-label') ?? bar.getAttribute('aria-labelledby');
      expect(name, bar.outerHTML.slice(0, 80)).toBeTruthy();
    }
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
