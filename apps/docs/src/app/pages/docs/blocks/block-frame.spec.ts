import { TestBed } from '@angular/core/testing';
import { ThemeService } from '../../../core/theme.service';
import { BlockFrame, MOBILE_WIDTH } from './block-frame';

/** Marco de la vista previa de un Block (B.1-g). */
describe('BlockFrame', () => {
  afterEach(() => document.querySelectorAll('app-block-frame').forEach((el) => el.remove()));

  function create(states = [{ id: 'loading', label: 'Cargando' }]) {
    const fixture = TestBed.createComponent(BlockFrame);
    fixture.componentRef.setInput('name', 'login-01');
    fixture.componentRef.setInput('states', states);
    const el = fixture.nativeElement as HTMLElement;
    // En el documento, para que el iframe tenga su propio documento (about:blank en jsdom).
    document.body.appendChild(el);
    fixture.detectChanges();
    const iframe = el.querySelector('iframe')!;
    const button = (text: string) =>
      [...el.querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith(text))!;
    return { fixture, el, iframe, button };
  }

  it('iframe con la ruta de la vista previa y su título', () => {
    const { iframe, el } = create();
    expect(iframe.getAttribute('src')).toBe('/preview/blocks/login-01');
    expect(iframe.title).toBe('Vista previa de login-01');
    expect(el.querySelector('a[target="_blank"]')?.getAttribute('href')).toBe(
      '/preview/blocks/login-01',
    );
  });

  it('ancho móvil: 375 px', () => {
    const { iframe, button, fixture } = create();
    expect(iframe.classList).toContain('w-full');
    button('Móvil').click();
    fixture.detectChanges();
    expect(iframe.style.width).toBe(`${MOBILE_WIDTH}px`);
    expect(iframe.classList).not.toContain('w-full');
  });

  it('el estado va en la URL (?state=)', () => {
    const { iframe, button, fixture } = create();
    button('Cargando').click();
    fixture.detectChanges();
    expect(iframe.getAttribute('src')).toBe('/preview/blocks/login-01?state=loading');
  });

  it('sin estados no muestra su selector', () => {
    const { el } = create([]);
    expect(el.querySelector('[aria-label="Estado del Block"]')).toBeNull();
  });

  it('el modo va en el <html> del iframe, no en el del sitio; sigue al sitio por defecto', () => {
    const theme = TestBed.inject(ThemeService);
    theme.preference.set('light');
    const { iframe, button, fixture } = create();
    // El entorno de pruebas no da documento al iframe: uno propio, como el de la vista previa.
    const frameDocument = document.implementation.createHTMLDocument('vista previa');
    Object.defineProperty(iframe, 'contentDocument', { value: frameDocument });
    const html = () => frameDocument.documentElement;
    frameDocument.documentElement.classList.add('dark');
    iframe.dispatchEvent(new Event('load'));
    TestBed.tick();
    expect(html().classList).not.toContain('dark');
    button('Oscuro').click();
    fixture.detectChanges();
    TestBed.tick();
    expect(html().classList).toContain('dark');
    expect(document.documentElement.classList).not.toContain('dark');
  });
});
