import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  MIMI_ERROR_MESSAGES_ES,
  provideMimiErrorMessages,
} from '@/components/ui/form-field/error-messages';
import { HighlighterService } from '../code/highlighter.service';
import { DOCS_NAV } from '../layout/docs-nav';
import { HomePage } from './home-page';

/** Las actualizaciones de los formularios llegan en microtareas. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

describe('HomePage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(HomePage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const text = (node: Element | null) => node?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    return { fixture, el, text };
  }

  it('hero: titular, badge sin fases y comando copiable (la CLI ya está publicada)', async () => {
    const { el, text } = await setup();
    expect(text(el.querySelector('h1'))).toBe(
      'Los componentes son tuyos. Las actualizaciones también.',
    );
    expect(text(el.querySelector('section span'))).toMatch(/^v\d+\.\d+\.\d+ · Vista previa$/);
    expect(el.querySelector('app-code-block')).not.toBeNull();
    expect(el.textContent).not.toContain('disponible pronto');
    // En los textos públicos no se mencionan las fases del plan.
    expect(el.textContent).not.toMatch(/\bFase\b/i);
  });

  it('los botones llevan a Instalación y a Button', async () => {
    const { el, text } = await setup();
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[mimiBtn]'));
    expect(links.map((a) => [text(a), a.getAttribute('href')])).toEqual([
      ['Empezar', '/docs/installation'],
      ['Componentes', '/docs/components/button'],
    ]);
  });

  it('todos los enlaces llevan a páginas listas del menú (ninguno a 404 o deshabilitadas)', async () => {
    const { el } = await setup();
    const ready = DOCS_NAV.flatMap((s) => s.items)
      .filter((i) => i.status === 'ready')
      .map((i) => i.path);
    const hrefs = Array.from(el.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(ready).toContain(href);
  });

  it('cuatro diferenciales; lo que no existe lleva su etiqueta y ninguno enlaza', async () => {
    const { el, text } = await setup();
    const cards = Array.from(el.querySelectorAll('[data-feature]'));
    expect(cards.length).toBe(4);
    const badges = cards
      .filter((c) => c.querySelector('[mimiBadge]'))
      .map((c) => [text(c.querySelector('h2')), text(c.querySelector('[mimiBadge]'))]);
    expect(badges).toEqual([
      // Ya funciona: omitir los modificados y actualizar los que no tocaste. Falta mimi update.
      ['Actualiza sin perder tus cambios', 'mimi update: próximamente'],
      ['¿Vienes de PrimeNG o NG-ZORRO? Te sentirás en casa', 'Próximamente'],
    ]);
    const updates = cards.find(
      (c) => text(c.querySelector('h2')) === 'Actualiza sin perder tus cambios',
    )!;
    expect(text(updates.querySelector('p'))).toContain('nunca se sobrescriben');
    expect(text(updates.querySelector('p'))).toContain('ng g mimi');
    for (const card of cards) expect(card.querySelector('a')).toBeNull();
  });

  it('vitrina «Hecho con Mimi» y pie con la licencia', async () => {
    const { el, text } = await setup();
    expect(text(el.querySelector('#showcase-title'))).toBe('Hecho con Mimi');
    expect(text(el.querySelector('footer'))).toBe('Mimi · Licencia MIT · Hecho para Angular');
  });

  it('preferencias: Verificar muestra el error; Guardar confirma; Cancelar restablece', async () => {
    const { fixture, el, text } = await setup();
    const card = el.querySelector('app-showcase-preferences')!;
    const buttons = Array.from(card.querySelectorAll<HTMLButtonElement>('button[mimiBtn]'));
    const button = (label: string) => buttons.find((b) => text(b) === label)!;
    const email = card.querySelector<HTMLInputElement>('input[type="email"]')!;
    const status = card.querySelector('[aria-live="polite"]:not(mimi-form-error)')!;

    button('Verificar').click();
    await settle(fixture);
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(card.textContent).toContain('Este campo es obligatorio.');

    email.value = 'equipo@empresa.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    button('Verificar').click();
    await settle(fixture);
    expect(text(status)).toBe('El correo es válido.');

    button('Guardar cambios').click();
    await settle(fixture);
    expect(text(status)).toBe('Cambios guardados.');

    button('Cancelar').click();
    await settle(fixture);
    expect(email.value).toBe('');
    expect(text(status)).toBe('');
    expect(card.querySelector<HTMLInputElement>('input:not([type])')!.value).toBe('panel-ventas');
  });

  it('equipo: «Invitar persona» agrega una cuarta persona y se deshabilita', async () => {
    const { fixture, el, text } = await setup();
    const card = el.querySelector('app-showcase-team')!;
    const rows = () => Array.from(card.querySelectorAll('li'));
    expect(rows().length).toBe(3);
    expect(text(card.querySelector('mimi-card-description'))).toBe('3 personas con acceso.');

    const invite = card.querySelector<HTMLButtonElement>('button[mimiBtn]')!;
    expect(invite.disabled).toBe(false);
    invite.click();
    await settle(fixture);

    expect(rows().length).toBe(4);
    const last = rows()[3];
    expect(text(last.querySelector('mimi-avatar-fallback'))).toBe('LP');
    expect(last.querySelector('mimi-avatar-fallback')!.getAttribute('aria-label')).toBe(
      'Lucía Pérez',
    );
    expect(last.textContent).toContain('lucia@empresa.com');
    expect(text(last.querySelector('[mimiBadge]'))).toBe('Lectura');
    expect(text(card.querySelector('mimi-card-description'))).toBe('4 personas con acceso.');
    expect(invite.disabled).toBe(true);
  });
});
