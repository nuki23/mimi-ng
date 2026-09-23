import { TestBed } from '@angular/core/testing';
import { COPIED_DURATION, CopyButton } from './copy-button';

describe('CopyButton', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  async function setup(text: string, withLabel = false) {
    const fixture = TestBed.createComponent(CopyButton);
    fixture.componentRef.setInput('text', text);
    fixture.componentRef.setInput('withLabel', withLabel);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      button: el.querySelector('button')!,
      live: el.querySelector('[aria-live]')!,
    };
  }

  it('copia el texto exacto y muestra el estado de copiado durante 2 segundos', async () => {
    const text = 'pnpm mimi add button\n  <b>"exacto"</b>';
    const { fixture, button, live } = await setup(text);
    expect(button.getAttribute('aria-label')).toBe('Copiar');
    expect(button.querySelector('svg[lucideCopy]')).not.toBeNull();
    expect(live.textContent?.trim()).toBe('');

    vi.useFakeTimers();
    button.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(text));
    fixture.detectChanges();
    expect(button.querySelector('svg[lucideCheck]')).not.toBeNull();
    expect(live.textContent?.trim()).toBe('Copiado');

    vi.advanceTimersByTime(COPIED_DURATION);
    fixture.detectChanges();
    expect(button.querySelector('svg[lucideCopy]')).not.toBeNull();
    expect(live.textContent?.trim()).toBe('');
  });

  it('la variante con texto cambia de «Copiar» a «Copiado»', async () => {
    const { fixture, button } = await setup('abc', true);
    expect(button.textContent?.trim()).toBe('Copiar');
    button.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('abc'));
    fixture.detectChanges();
    expect(button.textContent?.trim()).toBe('Copiado');
  });

  it('si el portapapeles falla no muestra «Copiado» ni lanza error', async () => {
    writeText.mockRejectedValue(new Error('sin permiso'));
    const { fixture, button, live } = await setup('abc');
    button.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    await fixture.whenStable();
    expect(live.textContent?.trim()).toBe('');
    expect(button.querySelector('svg[lucideCopy]')).not.toBeNull();
  });
});
