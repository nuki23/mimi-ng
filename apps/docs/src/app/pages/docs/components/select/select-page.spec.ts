import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SelectPage } from './select-page';

describe('SelectPage', () => {
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
    const fixture = TestBed.createComponent(SelectPage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(9);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-select button[role="combobox"]')).not.toBeNull();
      expect(code).toContain("from '@/components/ui/select';");
      expect(code).toMatch(/export class Select\w+Example/);
    }
    // Los textos de la página están en español (se proveen en la página, no en app.config).
    expect(el.querySelector('button[aria-label="Limpiar selección"]')).not.toBeNull();
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
