import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { TreePage } from './tree-page';

describe('TreePage', () => {
  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          {
            provide: HighlighterService,
            useValue: { highlight: () => new Promise(() => undefined) },
          },
        ],
      });
      const fixture = TestBed.createComponent(TreePage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(3);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-tree [role="tree"]')).not.toBeNull();
        expect(code).toContain("from '@/components/ui/tree';");
        expect(code).toMatch(/export class Tree\w+Example/);
      }
      // Cada árbol tiene nombre.
      for (const tree of Array.from(el.querySelectorAll('[role="tree"]'))) {
        expect(
          tree.getAttribute('aria-label') || tree.getAttribute('aria-labelledby'),
        ).toBeTruthy();
      }
      // El de permisos arranca con un padre completo y la casilla parcial donde falta uno.
      const permisos = el.querySelector('[role="tree"][aria-label="Permisos"]')!;
      expect(permisos.querySelector('[data-id="projects"]')!.getAttribute('aria-checked')).toBe(
        'mixed',
      );
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
