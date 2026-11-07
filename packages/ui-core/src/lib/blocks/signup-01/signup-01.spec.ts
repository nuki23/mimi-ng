import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Signup01, type Signup01Value } from './signup-01';

@Component({
  imports: [Signup01],
  template: `<mimi-signup-01
    class="bg-muted"
    [loading]="loading()"
    [error]="error()"
    (submitted)="submitted.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitted: Signup01Value[] = [];
}

/** signup-01 (B.4). */
describe('Signup01', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const inputs = () => [...el.querySelectorAll<HTMLInputElement>('input')];
    const field = (label: string) => {
      const l = [...el.querySelectorAll('label')].find((x) => x.textContent?.trim() === label)!;
      return document.getElementById(l.getAttribute('for')!) as HTMLInputElement;
    };
    const type = async (label: string, value: string) => {
      const input = field(label);
      input.value = value;
      // Burbujea, como en el navegador: mimi-password lo escucha en su anfitrión.
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    };
    const blur = async (label: string) => {
      field(label).dispatchEvent(new Event('blur'));
      await fixture.whenStable();
    };
    const button = () => q<HTMLButtonElement>('button[type="submit"]');
    const hint = () => document.getElementById(button().getAttribute('aria-describedby')!)!;
    const fillAll = async () => {
      await type('Full name', 'Ana Torres');
      await type('Work email', 'ana@empresa.com');
      await type('Password', 'Mimi2026!');
      await type('Confirm password', 'Mimi2026!');
      q<HTMLButtonElement>('[role="checkbox"]').click();
      await fixture.whenStable();
    };
    return {
      fixture,
      el,
      q,
      inputs,
      field,
      type,
      blur,
      button,
      hint,
      fillAll,
      host: fixture.componentInstance,
    };
  }

  afterEach(() => document.querySelectorAll('ng-component').forEach((n) => n.remove()));

  it('nombre: el mensaje al salir del campo; «Looks good.» si está bien', async () => {
    const { type, blur, field, el } = await setup();
    await type('Full name', 'A');
    expect(el.textContent).not.toContain('Enter your name.');
    await blur('Full name');
    expect(el.textContent).toContain('Enter your name.');
    expect(field('Full name').getAttribute('aria-invalid')).toBe('true');
    await type('Full name', 'Ana');
    expect(el.textContent).not.toContain('Enter your name.');
    expect(el.textContent).toContain('Looks good.');
    // El mensaje de válido describe el campo.
    const ids = field('Full name').getAttribute('aria-describedby')!.split(' ');
    expect(
      ids.some((id) => document.getElementById(id)?.textContent?.includes('Looks good.')),
    ).toBe(true);
  });

  it('correo: dominio que falta y «Valid email.»', async () => {
    const { type, blur, el } = await setup();
    await type('Work email', 'ana@empresa');
    await blur('Work email');
    expect(el.textContent).toContain('Add the domain, for example ana@company.com.');
    await type('Work email', 'ana@empresa.com');
    expect(el.textContent).toContain('Valid email.');
  });

  it('fuerza: «fuerte» con las cuatro reglas; el medidor de Password lo muestra', async () => {
    const { type, el, host, fixture, q, hint } = await setup();
    await type('Password', 'Mimi2026');
    expect(hint().textContent).toContain('a strong password');
    expect(q('mimi-password').getAttribute('data-level')).toBe('2');
    await type('Password', 'Mimi2026!');
    expect(hint().textContent).not.toContain('a strong password');
    expect(q('mimi-password').getAttribute('data-level')).toBe('3');
    expect(el.textContent).toContain('A symbol');
    expect(host.submitted).toEqual([]);
    void fixture;
  });

  it('confirmación: «no coinciden» y deja de decirlo en cuanto coinciden', async () => {
    const { type, blur, el } = await setup();
    await type('Password', 'Mimi2026!');
    await type('Confirm password', 'Mimi2025!');
    await blur('Confirm password');
    expect(el.textContent).toContain("Passwords don't match.");
    await type('Confirm password', 'Mimi2026!');
    expect(el.textContent).not.toContain("Passwords don't match.");
    expect(el.textContent).toContain('They match.');
  });

  it('el botón usa aria-disabled (no disabled) con la nota de lo que falta', async () => {
    const { button, hint } = await setup();
    expect(button().disabled).toBe(false);
    expect(button().getAttribute('aria-disabled')).toBe('true');
    expect(hint().textContent?.trim()).toBe(
      'Missing: your name, a valid email, a strong password, matching passwords, accepting the terms.',
    );
  });

  it('pulsarlo incompleto: marca todo, no envía y lleva el foco al primer error', async () => {
    const { button, host, field, fixture, type, el } = await setup();
    await type('Full name', 'Ana Torres');
    button().click();
    await fixture.whenStable();
    expect(host.submitted).toEqual([]);
    expect(document.activeElement).toBe(field('Work email'));
    expect(el.textContent).toContain('Enter your work email.');
    expect(el.textContent).toContain('Accept the terms to continue.');
  });

  it('completo: «All set.», envía nombre, correo y contraseña', async () => {
    const { fillAll, button, hint, host, fixture, q } = await setup();
    await fillAll();
    expect(hint().textContent?.trim()).toBe('All set.');
    expect(button().getAttribute('aria-disabled')).toBeNull();
    expect(q('mimi-signup-01').getAttribute('data-state')).toBe('complete');
    button().click();
    await fixture.whenStable();
    expect(host.submitted).toEqual([
      { name: 'Ana Torres', email: 'ana@empresa.com', password: 'Mimi2026!' },
    ]);
  });

  it('loading: «Creating account…», aria-busy y no reenvía; error en el role="alert"', async () => {
    const { fillAll, button, host, fixture, q } = await setup();
    await fillAll();
    host.loading.set(true);
    host.error.set('This email is already registered.');
    await fixture.whenStable();
    expect(button().textContent?.trim()).toBe('Creating account…');
    expect(button().getAttribute('aria-busy')).toBe('true');
    button().click();
    await fixture.whenStable();
    expect(host.submitted).toEqual([]);
    expect(q('[role="alert"]').textContent).toContain('This email is already registered.');
  });

  it('contraseñas con autocomplete="new-password"; un h1; class del usuario', async () => {
    const { inputs, el, q } = await setup();
    const passwords = inputs().filter((i) => i.type === 'password');
    expect(passwords.map((i) => i.autocomplete)).toEqual(['new-password', 'new-password']);
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    expect(q('mimi-signup-01').classList).toContain('bg-muted');
    expect(q('mimi-signup-01').classList).not.toContain('bg-background');
  });
});
