import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Otp01, type Otp01Status } from './otp-01';

@Component({
  imports: [Otp01],
  template: `<mimi-otp-01
    class="bg-muted"
    destination="a••••@company.com"
    [resendSeconds]="resendSeconds()"
    [status]="status()"
    [loading]="loading()"
    (verify)="codes.push($event)"
    (resend)="resends = resends + 1"
    (changeDestination)="changes = changes + 1"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly resendSeconds = signal(42);
  readonly status = signal<Otp01Status>('idle');
  readonly loading = signal(false);
  readonly codes: string[] = [];
  resends = 0;
  changes = 0;
}

/** otp-01 (B.5). Temporizadores falsos para la cuenta regresiva (M.12). */
describe('Otp01', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll('ng-component').forEach((n) => n.remove());
  });

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const input = () => q<HTMLInputElement>('mimi-input-otp input');
    const settle = async () => {
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
    };
    const type = async (value: string) => {
      input().value = value;
      input().dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
    };
    const buttons = () => [...el.querySelectorAll<HTMLButtonElement>('button')];
    const button = (text: string) => buttons().find((b) => b.textContent?.includes(text))!;
    const status = () => q('[role="status"]');
    return { fixture, el, q, input, type, settle, button, status, host: fixture.componentInstance };
  }

  it('verify al completar los dígitos, una sola vez por código (también con el botón)', async () => {
    const { type, button, settle, host } = await setup();
    await type('246');
    expect(host.codes).toEqual([]);
    await type('246810');
    expect(host.codes).toEqual(['246810']);
    button('Verify').click();
    await settle();
    expect(host.codes).toEqual(['246810']);
    await type('246811');
    expect(host.codes).toEqual(['246810', '246811']);
  });

  it('con el botón e incompleto: no envía y dice cuántos dígitos faltan', async () => {
    const { type, button, settle, host, status, input } = await setup();
    await type('24');
    button('Verify').click();
    await settle();
    expect(host.codes).toEqual([]);
    expect(status().textContent).toContain('Enter the 6-digit code.');
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('status pinta error y éxito para el código enviado; al cambiarlo vuelve a idle', async () => {
    const { type, settle, host, status, q } = await setup();
    await type('246811');
    host.status.set('error');
    await settle();
    expect(status().textContent).toContain('Incorrect code.');
    expect(q('mimi-otp-01').getAttribute('data-state')).toBe('error');
    await type('24681');
    expect(status().textContent).toContain('The code expires in 10 minutes.');
    await type('246810');
    host.status.set('success');
    await settle();
    expect(status().textContent).toContain('Code verified.');
    expect(q('mimi-input-otp').getAttribute('data-state') ?? '').not.toBe('error');
  });

  it('el mensaje describe el código (role="status")', async () => {
    const { input, status } = await setup();
    expect(input().getAttribute('aria-describedby')).toContain(status().id);
  });

  it('cuenta regresiva y resend; el anuncio solo al habilitarse', async () => {
    const { button, settle, host, el, type, input } = await setup();
    const resend = () => button('Resend');
    expect(resend().textContent?.trim()).toBe('Resend in 0:42');
    expect(resend().disabled).toBe(true);
    const live = el.querySelector('[aria-live="polite"].sr-only')!;
    await vi.advanceTimersByTimeAsync(1000);
    await settle();
    expect(resend().textContent?.trim()).toBe('Resend in 0:41');
    expect(live.textContent?.trim()).toBe('');
    await vi.advanceTimersByTimeAsync(41_000);
    await settle();
    expect(resend().textContent?.trim()).toBe('Resend code');
    expect(resend().disabled).toBe(false);
    expect(live.textContent?.trim()).toBe('You can request another code now.');

    await type('123');
    resend().click();
    await settle();
    expect(host.resends).toBe(1);
    expect(input().value).toBe('');
    expect(resend().textContent?.trim()).toBe('Resend in 0:42');
    expect(live.textContent?.trim()).toBe('');
  });

  it('loading: «Verifying…», aria-busy y no envía', async () => {
    const { host, settle, button, type } = await setup();
    host.loading.set(true);
    await settle();
    const verify = button('Verifying');
    expect(verify.getAttribute('aria-busy')).toBe('true');
    await type('246810');
    expect(host.codes).toEqual([]);
  });

  it('changeDestination, foco inicial en el código, un h1 y class', async () => {
    const { button, host, input, el, q } = await setup();
    expect(document.activeElement).toBe(input());
    button('Use another email').click();
    expect(host.changes).toBe(1);
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    expect(q('mimi-otp-01').classList).toContain('bg-muted');
    expect(q('mimi-otp-01').classList).not.toContain('bg-background');
  });
});
