import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Login02, type Login02Value } from './login-02';

@Component({
  imports: [Login02],
  template: `<mimi-login-02
    class="md:flex-row-reverse"
    [loading]="loading()"
    [error]="error()"
    [imageSrc]="imageSrc()"
    [imageAlt]="imageAlt()"
    (submitted)="submitted.push($event)"
    (sso)="sso = sso + 1"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly imageSrc = signal<string | null>(null);
  readonly imageAlt = signal('');
  readonly submitted: Login02Value[] = [];
  sso = 0;
}

/** login-02 (B.3). */
describe('Login02', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const type = async (selector: string, value: string) => {
      const input = q<HTMLInputElement>(selector);
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const submit = async () => {
      q<HTMLButtonElement>('button[type="submit"]').click();
      await fixture.whenStable();
    };
    return { fixture, el, q, type, submit, host: fixture.componentInstance };
  }

  afterEach(() => document.querySelectorAll('ng-component').forEach((n) => n.remove()));

  it('envía el valor con un formulario válido', async () => {
    const { type, submit, host } = await setup();
    await type('input[type="email"]', 'ana@empresa.com');
    await type('input[type="password"]', 'secreto');
    await submit();
    expect(host.submitted).toEqual([{ email: 'ana@empresa.com', password: 'secreto' }]);
  });

  it('inválido: no envía y lleva el foco al primer error', async () => {
    const { submit, host, q } = await setup();
    await submit();
    expect(host.submitted).toEqual([]);
    expect(document.activeElement).toBe(q('input[type="email"]'));
  });

  it('loading: «Signing in…», aria-busy y no envía', async () => {
    const { type, submit, host, q, fixture } = await setup();
    await type('input[type="email"]', 'ana@empresa.com');
    await type('input[type="password"]', 'x');
    host.loading.set(true);
    await fixture.whenStable();
    const button = q('button[type="submit"]');
    expect(button.textContent?.trim()).toBe('Signing in…');
    expect(button.getAttribute('aria-busy')).toBe('true');
    await submit();
    expect(host.submitted).toEqual([]);
  });

  it('error en el role="alert"', async () => {
    const { host, q, fixture } = await setup();
    host.error.set('Wrong email or password.');
    await fixture.whenStable();
    expect(q('[role="alert"]').textContent).toContain('Wrong email or password.');
  });

  it('sso', async () => {
    const { el, host } = await setup();
    [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('SSO'))!.click();
    expect(host.sso).toBe(1);
  });

  it('sin imageSrc: el degradado provisional; con imageSrc: la imagen, alt vacío por defecto', async () => {
    const { host, q, el, fixture } = await setup();
    expect(q('[data-slot="placeholder"]').getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('img')).toBeNull();
    host.imageSrc.set('/img/login.jpg');
    await fixture.whenStable();
    const img = q<HTMLImageElement>('img');
    expect(img.getAttribute('src')).toBe('/img/login.jpg');
    expect(img.getAttribute('alt')).toBe('');
    expect(el.querySelector('[data-slot="placeholder"]')).toBeNull();
    host.imageAlt.set('Warehouse at dawn');
    await fixture.whenStable();
    expect(img.getAttribute('alt')).toBe('Warehouse at dawn');
  });

  it('testimonio en figure con blockquote y figcaption; un h1', async () => {
    const { el, q } = await setup();
    expect(q('figure blockquote')).toBeTruthy();
    // M5: texto de relleno genérico, sin una persona ni una marca de terceros.
    expect(q('figure blockquote').textContent?.trim()).toBe(
      'Add a short quote from a customer here.',
    );
    expect(q('figure figcaption').textContent).toContain('Customer name');
    expect(q('figure figcaption').textContent).toContain('Role · Company');
    expect(q('figcaption mimi-avatar').textContent?.trim()).toBe('CN');
    expect(el.querySelectorAll('h1')).toHaveLength(1);
  });

  it('class del usuario', async () => {
    const { q } = await setup();
    expect(q('mimi-login-02').classList).toContain('md:flex-row-reverse');
  });
});
