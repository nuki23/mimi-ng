import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { TreePage } from './tree-page';
import { TREE_PAGE } from './tree.page';

// El orden de las secciones y los límites de la plantilla los prueba doc-page/doc-pages.spec.ts.
describe('TreePage', () => {
  it('cumple la plantilla', () => expect(validateDocPage(TREE_PAGE)).toEqual([]));

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
      // La demo y tres ejemplos; los formularios van en las pestañas, sin ejemplos vivos.
      expect(previews.length).toBe(4);
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
      // Estados: un nodo deshabilitado y un árbol entero deshabilitado.
      const states = previews[1].example!;
      expect(
        states.querySelector('[role="treeitem"][data-id="abrigos"][aria-disabled]'),
      ).not.toBeNull();
      expect(states.querySelector('[role="tree"][aria-disabled="true"]')).not.toBeNull();
      // «Archivos» va en dos archivos (los datos aparte), para no pasar de 80 líneas.
      const files = previews.find(({ code }) => code.includes('TreeFilesExample'));
      expect(files?.example?.querySelector('[data-id="assets"]')).not.toBeNull();
      // El de permisos arranca con un padre completo y la casilla parcial donde falta uno.
      const permisos = el.querySelector('[role="tree"][aria-label="Permisos"]')!;
      expect(permisos.querySelector('[data-id="projects"]')!.getAttribute('aria-checked')).toBe(
        'mixed',
      );
      // Las pestañas de formularios (R.13), los textos y las variables.
      expect(el.querySelector('app-forms-tabs')).not.toBeNull();
      expect(el.querySelector('#texts')).not.toBeNull();
      expect(el.querySelector('#tokens')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
