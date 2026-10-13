import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HighlighterService } from '../../../../code/highlighter.service';
import { ContextMenuPage } from './context-menu-page';

describe('ContextMenuPage', () => {
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
    const fixture = TestBed.createComponent(ContextMenuPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(5);
    for (const preview of previews) {
      expect(preview.querySelector('[mimiContextMenuTrigger][data-state]')).not.toBeNull();
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      expect(code).toContain("from '@/components/ui/context-menu';");
      expect(code).toMatch(/export class ContextMenu\w+Example/);
    }
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
