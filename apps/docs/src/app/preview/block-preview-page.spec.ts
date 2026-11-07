import { ChangeDetectionStrategy, Component, DOCUMENT, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from '../app';
import { routes } from '../app.routes';
import { THEME_STORAGE_KEY } from '../core/theme.service';
import { BLOCKS_STYLESHEET } from './block-preview-page';
import { BLOCK_PREVIEWS } from './block-previews';

@Component({
  selector: 'app-fake-block',
  template: `<h1>Bloque falso</h1>
    <p data-testid="loading">{{ loading() }}</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FakeBlock {
  readonly loading = input(false);
}

/** Vista previa de un Block (B.1-g): ruta sin shell, hoja propia, estados y modo oscuro. */
describe('/preview/blocks/:name', () => {
  beforeEach(() => {
    BLOCK_PREVIEWS['fake-01'] = {
      load: () => Promise.resolve(FakeBlock),
      states: { loading: { loading: true } },
    };
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  afterEach(() => {
    delete BLOCK_PREVIEWS['fake-01'];
    const doc = TestBed.inject(DOCUMENT);
    doc.head.querySelectorAll('link[data-mimi-blocks]').forEach((l) => l.remove());
    doc.documentElement.classList.remove('dark');
  });

  async function open(url: string) {
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    harness.detectChanges();
    return harness;
  }

  it('muestra el Block, con su título, y carga la hoja de los Blocks una sola vez', async () => {
    const harness = await open('/preview/blocks/fake-01');
    // El Block va junto a la página (mismo lugar del router-outlet).
    const root = harness.fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toBe('Bloque falso');
    expect(TestBed.inject(DOCUMENT).title).toBe('Vista previa de un Block · Mimi');
    await harness.navigateByUrl('/preview/blocks/fake-01?state=loading');
    const links = TestBed.inject(DOCUMENT).head.querySelectorAll('link[data-mimi-blocks]');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(BLOCKS_STYLESHEET);
  });

  it('?state= pasa las entradas del estado al Block', async () => {
    const harness = await open('/preview/blocks/fake-01?state=loading');
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(
      (harness.fixture.nativeElement as HTMLElement).querySelector('[data-testid="loading"]')
        ?.textContent,
    ).toBe('true');
  });

  it('un nombre desconocido lo dice', async () => {
    const harness = await open('/preview/blocks/nope');
    expect(harness.routeNativeElement?.textContent).toContain('No hay ningún Block llamado «nope»');
  });

  it('?theme=dark pone .dark en el <html> del documento', async () => {
    await open('/preview/blocks/fake-01?theme=dark');
    expect(TestBed.inject(DOCUMENT).documentElement.classList).toContain('dark');
  });

  it('sigue la elección guardada del sitio (evento storage)', async () => {
    await open('/preview/blocks/fake-01');
    const doc = TestBed.inject(DOCUMENT);
    doc.defaultView!.dispatchEvent(
      new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'dark' }),
    );
    expect(doc.documentElement.classList).toContain('dark');
    doc.defaultView!.dispatchEvent(
      new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light' }),
    );
    expect(doc.documentElement.classList).not.toContain('dark');
  });
});

describe('App y la vista previa', () => {
  it('en /preview/... no pinta el header, el menú móvil ni el salto al contenido', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'preview/blocks/:name', component: FakeBlock },
          { path: 'otra', component: FakeBlock },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const el = fixture.nativeElement as HTMLElement;
    await router.navigateByUrl('/preview/blocks/fake-01');
    await fixture.whenStable();
    expect(el.querySelector('app-site-header')).toBeNull();
    expect(el.querySelector('app-mobile-nav')).toBeNull();
    expect(el.querySelector('main')).toBeNull();
    expect(el.textContent).not.toContain('Saltar al contenido');
    expect(el.querySelector('h1')?.textContent).toBe('Bloque falso');

    await router.navigateByUrl('/otra');
    await fixture.whenStable();
    expect(el.querySelector('app-site-header')).not.toBeNull();
    expect(el.querySelector('main')).not.toBeNull();
  });
});
