import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { DateRangePage } from './date-range-page';

describe('DateRangePage', () => {
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
    const fixture = TestBed.createComponent(DateRangePage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(2);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-date-range button[aria-haspopup]')).not.toBeNull();
      expect(code).toContain("from '@/components/ui/date-range';");
      expect(code).toMatch(/export class DateRange\w+Example/);
    }
    for (const button of Array.from(
      el.querySelectorAll<HTMLButtonElement>('mimi-date-range button[aria-haspopup]'),
    )) {
      const named =
        button.getAttribute('aria-label') ||
        (button.id && el.querySelector(`label[for="${button.id}"]`));
      expect(named, button.outerHTML).toBeTruthy();
    }
    const days = Array.from(el.querySelectorAll('mimi-date-range [data-slot="days"]')).map((d) =>
      d.textContent?.trim(),
    );
    expect(days).toContain('20 días');
    expect(days).toContain('7 días');
    expect(el.textContent).toContain('1 sept 2026 – 20 sept 2026');
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
