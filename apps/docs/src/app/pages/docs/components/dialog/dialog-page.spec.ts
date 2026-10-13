import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HighlighterService } from '../../../../code/highlighter.service';
import { DialogPage } from './dialog-page';

describe('DialogPage', () => {
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
    const fixture = TestBed.createComponent(DialogPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(7);
    for (const preview of previews) {
      expect(preview.querySelector('button')).not.toBeNull();
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      expect(code).toContain("from '@/components/ui/dialog';");
      expect(code).toMatch(/export class Dialog\w+Example/);
    }
    expect(el.querySelectorAll('[mimiDialogTrigger][aria-haspopup="dialog"]').length).toBe(5);
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
