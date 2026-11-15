import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { AvatarPage } from './avatar-page';
import { AVATAR_PAGE } from './avatar.page';

describe('AvatarPage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(AvatarPage);
    await settle(fixture);
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('cumple la plantilla', () => expect(validateDocPage(AVATAR_PAGE)).toEqual([]));

  it(
    'cada ejemplo corre en Preview y su pestaña Código muestra el archivo real',
    async () => {
      const { fixture, el } = await setup();
      // El orden de las secciones y los límites los prueba doc-page/doc-pages.spec.ts.
      const previews = examples(fixture);
      // La demo y tres ejemplos.
      expect(previews.length).toBe(4);
      for (const { example, code } of previews) {
        expect(example?.querySelector('mimi-avatar')).not.toBeNull();
        expect(code).toContain("import { MimiAvatarImports } from '@/components/ui/avatar';");
        expect(code).toMatch(/export class Avatar\w+Example/);
      }
      // Los ejemplos usan las imágenes de apps/docs/public/avatars/.
      const srcs = Array.from(el.querySelectorAll('img[src^="/avatars/"]')).map((i) =>
        i.getAttribute('src'),
      );
      expect(srcs).toContain('/avatars/avatar-1.svg');
      expect(srcs).toContain('/avatars/avatar-2.svg');
      expect(srcs).toContain('/avatars/avatar-3.svg');
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Avatar');
    },
    PAGE_EXAMPLES_TIMEOUT,
  );

  it('la imagen que falla no pide nada a la red (sin 404 en la consola)', async () => {
    const { el } = await setup();
    const img = el.querySelector('app-avatar-fallback-example img')!;
    expect(img.getAttribute('src')).toMatch(/^data:/);
    // Ninguna imagen de la página apunta a un archivo que no está en public/avatars/.
    for (const i of Array.from(el.querySelectorAll('img[src^="/"]'))) {
      expect(i.getAttribute('src')).toMatch(/^\/avatars\/avatar-[123]\.svg$/);
    }
  });
});
