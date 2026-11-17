import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { MimiOverlayPresentation } from '@/components/ui/utils/overlay-config';
import { MimiCommandImports } from './command';

// R.34: Command a pantalla completa en el teléfono (decidido por el usuario el 15/11/2026).
@Component({
  imports: [MimiCommandImports],
  template: `<mimi-command-dialog
    [(open)]="open"
    [presentation]="presentation()"
    [items]="items"
  />`,
})
class Host {
  readonly open = signal(false);
  readonly presentation = signal<MimiOverlayPresentation>('auto');
  readonly items = [{ id: 'a', label: 'Abrir' }];
}

describe('Command a pantalla completa (R.34)', () => {
  let narrow = false;
  const original = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: narrow && query === '(max-width: 639.98px)',
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
    narrow = false;
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  async function openWith(presentation: MimiOverlayPresentation = 'auto') {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentInstance.presentation.set(presentation);
    fixture.componentInstance.open.set(true);
    for (let i = 0; i < 2; i++) {
      fixture.detectChanges();
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }
    const host = (fixture.nativeElement as HTMLElement).querySelector('mimi-command-dialog')!;
    return {
      host,
      panel: document.querySelector<HTMLElement>('mimi-dialog-panel, [role="dialog"]'),
    };
  }

  it('en el teléfono, a pantalla completa', async () => {
    narrow = true;
    const { host } = await openWith();
    expect(host.getAttribute('data-presentation')).toBe('fullscreen');
    expect(document.querySelector('.h-dvh.w-screen')).not.toBeNull();
  });

  it('en escritorio, la ventana centrada; presentation="popover" la conserva en el teléfono', async () => {
    const desktop = await openWith();
    expect(desktop.host.getAttribute('data-presentation')).toBe('popover');
    expect(document.querySelector('.h-dvh.w-screen')).toBeNull();
    TestBed.resetTestingModule();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
    narrow = true;
    const kept = await openWith('popover');
    expect(kept.host.getAttribute('data-presentation')).toBe('popover');
  });
});
