import { TestBed } from '@angular/core/testing';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { PopoverPage } from './popover-page';

describe('PopoverPage', () => {
  it('cada ejemplo corre en Preview y su pestaña Código muestra el archivo real', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(PopoverPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(5);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-popover [mimiPopoverTrigger]')).not.toBeNull();
      expect(code).toContain("from '@/components/ui/popover';");
      expect(code).toMatch(/export class Popover\w+Example/);
    }
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
