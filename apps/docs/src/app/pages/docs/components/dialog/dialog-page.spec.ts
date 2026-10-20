import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
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
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(7);
    for (const { example, code } of previews) {
      expect(example?.querySelector('button')).not.toBeNull();
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
