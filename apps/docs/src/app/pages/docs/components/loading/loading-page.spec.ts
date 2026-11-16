import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { examples, PAGE_EXAMPLES_TIMEOUT, settle } from '../../../../code/code-preview.testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { validateDocPage } from '../../../../doc-page/doc-page.rules';
import { LoadingPage } from './loading-page';
import { LOADING_PAGE } from './loading.page';

describe('LoadingPage (R.23)', () => {
  it('cumple la plantilla', () => expect(validateDocPage(LOADING_PAGE)).toEqual([]));

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
          { provide: LiveAnnouncer, useValue: { announce: () => Promise.resolve() } },
        ],
      });
      const fixture = TestBed.createComponent(LoadingPage);
      await settle(fixture);
      const el = fixture.nativeElement as HTMLElement;

      const previews = examples(fixture);
      expect(previews.length).toBe(3);
      for (const { code } of previews) {
        expect(code).toContain("from '@/components/ui/loading';");
        expect(code).toMatch(/export class Loading\w+Example/);
      }
      // «Cargar una tarjeta»: el botón la bloquea con el mensaje en español de la página.
      const block = el.querySelector<HTMLElement>('app-loading-block-example')!;
      // Con reloj falso desde el clic (M.12; el revisor lo vio fallar con la máquina ocupada): con
      // reloj real, los 1500 ms en que el ejemplo termina de guardar podían pasar antes de mirar.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        block.querySelector<HTMLButtonElement>('footer button')!.click();
        await vi.advanceTimersByTimeAsync(250);
        const card = block.querySelector<HTMLElement>('section')!;
        expect(card.getAttribute('aria-busy')).toBe('true');
        expect(card.querySelector('mimi-loading-overlay')!.textContent).toContain('Guardando…');
        // Y termina: a los 1500 ms deja de guardar (más el mínimo visible).
        await vi.advanceTimersByTimeAsync(2000);
        expect(card.getAttribute('aria-busy')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
      expect(el.querySelector('h1')!.textContent!.trim()).toBe('Loading');
      expect(el.querySelector('#texts')).not.toBeNull();
    },
    PAGE_EXAMPLES_TIMEOUT,
  );
});
