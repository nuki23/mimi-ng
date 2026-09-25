import { TestBed } from '@angular/core/testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SkeletonPage } from './skeleton-page';

describe('SkeletonPage', () => {
  it('cada ejemplo corre en Preview y su pestaña Código muestra el archivo real', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(SkeletonPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(4);
    for (const preview of previews) {
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      expect(code).toContain("import { MimiSkeleton } from '@/components/ui/skeleton';");
      expect(code).toMatch(/export class Skeleton\w+Example/);
    }
    // El ejemplo de carga empieza con el contenido; los demás muestran skeletons.
    expect(el.querySelectorAll('mimi-skeleton').length).toBeGreaterThan(0);
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
