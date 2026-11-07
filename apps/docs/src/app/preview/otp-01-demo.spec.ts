import { TestBed } from '@angular/core/testing';
import { OTP_DEMO_CODE, Otp01Demo } from './otp-01-demo';

/** La demo de otp-01 en la vista previa: carga, error con otro código y éxito con 246810. */
describe('Otp01Demo', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('verificación de mentira', async () => {
    const fixture = TestBed.createComponent(Otp01Demo);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('mimi-input-otp input')!;
    const type = async (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
    };
    const status = () => el.querySelector('[role="status"]')!.textContent;

    await type('111111');
    expect(el.querySelector('[aria-busy="true"]')).not.toBeNull();
    await vi.advanceTimersByTimeAsync(600);
    fixture.detectChanges();
    expect(status()).toContain('Incorrect code.');

    await type(OTP_DEMO_CODE);
    await vi.advanceTimersByTimeAsync(600);
    fixture.detectChanges();
    expect(status()).toContain('Code verified.');
  });
});
