import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HighlighterService } from '../../../code/highlighter.service';
import { BLOCK_PREVIEWS } from '../../../preview/block-previews';
import { Login01Page } from './login-01-page';

/** Página de login-01 (B.2): plantilla BlockDoc, archivos reales y estados de la vista previa. */
describe('Login01Page', () => {
  it('vista previa, instalación, componentes, código real y API', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(Login01Page);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('login-01');
    expect(el.querySelector('iframe')?.getAttribute('src')).toBe('/preview/blocks/login-01');
    expect(el.textContent).toContain('ng g mimi login-01');
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'preview',
      'installation',
      'usage',
      'code',
      'api',
    ]);
    const links = Array.from(el.querySelectorAll('#components + ul a')).map((a) => a.textContent);
    expect(links).toEqual([
      'card',
      'input',
      'password',
      'checkbox',
      'button',
      'form-field',
      'separator',
    ]);
    // Los tres archivos del Block, con su contenido real.
    const files = Array.from(el.querySelectorAll('#code ~ h3')).map((h) => h.textContent);
    expect(files).toEqual(['login-01/login-01.ts', 'login-01/login-01.html', 'login-01/index.ts']);
    // Los estados del selector existen en la vista previa.
    for (const id of ['loading', 'error']) {
      expect(BLOCK_PREVIEWS['login-01'].states?.[id], id).toBeDefined();
    }
    expect(await BLOCK_PREVIEWS['login-01'].load()).toEqual(expect.any(Function));
  });
});
