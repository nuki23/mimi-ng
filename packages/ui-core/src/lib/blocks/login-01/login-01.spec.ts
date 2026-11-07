import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Login01, type Login01Provider, type Login01Value } from './login-01';

@Component({
  imports: [Login01],
  template: `<mimi-login-01
    class="p-0"
    [loading]="loading()"
    [error]="error()"
    signupHref="/signup"
    (submitted)="submitted.push($event)"
    (provider)="providers.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitted: Login01Value[] = [];
  readonly providers: Login01Provider[] = [];
}

/** login-01 (B.2). */
describe('Login01', () => {
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
    await type('input[autocomplete="current-password"]', 'secreto123');
    await submit();
    expect(host.submitted).toEqual([
      { email: 'ana@empresa.com', password: 'secreto123', remember: true },
    ]);
  });

  it('inválido: no envía, marca los errores y lleva el foco al primero', async () => {
    const { submit, host, el, q } = await setup();
    await submit();
    expect(host.submitted).toEqual([]);
    const email = q<HTMLInputElement>('input[type="email"]');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(email);
    expect(el.textContent).toContain('This field is required.');
  });

  it('correo mal escrito: el mensaje de email', async () => {
    const { type, submit, el, host } = await setup();
    await type('input[type="email"]', 'ana');
    await type('input[autocomplete="current-password"]', 'x');
    await submit();
    expect(host.submitted).toEqual([]);
    expect(el.textContent).toContain('Enter a valid email address.');
  });

  it('«recordarme» va en el valor', async () => {
    const { type, submit, host, q, fixture } = await setup();
    q<HTMLButtonElement>('[role="checkbox"]').click();
    await fixture.whenStable();
    await type('input[type="email"]', 'ana@empresa.com');
    await type('input[autocomplete="current-password"]', 'x');
    await submit();
    expect(host.submitted[0].remember).toBe(false);
  });

  it('loading: «Signing in…», aria-busy y no vuelve a enviar', async () => {
    const { type, submit, host, q, fixture } = await setup();
    await type('input[type="email"]', 'ana@empresa.com');
    await type('input[autocomplete="current-password"]', 'x');
    host.loading.set(true);
    await fixture.whenStable();
    const button = q<HTMLButtonElement>('button[type="submit"]');
    expect(button.textContent?.trim()).toBe('Signing in…');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    await submit();
    expect(host.submitted).toEqual([]);
    expect(q('mimi-login-01').getAttribute('data-state')).toBe('loading');
  });

  it('error: en el role="alert", que existe siempre', async () => {
    const { host, q, fixture } = await setup();
    const alert = q('[role="alert"]');
    expect(alert.textContent?.trim()).toBe('');
    host.error.set('Wrong email or password.');
    await fixture.whenStable();
    expect(q('[role="alert"]')).toBe(alert);
    expect(alert.textContent).toContain('Wrong email or password.');
  });

  it('provider con cada red', async () => {
    const { el, host } = await setup();
    const buttons = [...el.querySelectorAll<HTMLButtonElement>('button[type="button"]')];
    buttons.find((b) => b.textContent?.includes('Google'))!.click();
    buttons.find((b) => b.textContent?.includes('GitHub'))!.click();
    expect(host.providers).toEqual(['google', 'github']);
  });

  it('accesibilidad de página: un h1, formulario con nombre, etiqueta de la contraseña y enlaces', async () => {
    const { el, q } = await setup();
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    const form = q('form');
    expect(document.getElementById(form.getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Sign in',
    );
    const password = q<HTMLInputElement>('input[autocomplete="current-password"]');
    expect(q(`label[for="${password.id}"]`).textContent).toBe('Password');
    expect(q<HTMLAnchorElement>('a[href="/signup"]').textContent).toBe('Sign up');
    expect(q('[aria-hidden="true"].absolute')).toBeTruthy();
  });

  it('class del usuario gana con cn()', async () => {
    const { q } = await setup();
    const host = q('mimi-login-01');
    expect(host.classList).toContain('p-0');
    expect(host.classList).not.toContain('px-[22px]');
  });
});
