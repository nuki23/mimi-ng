import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MobileNav } from './mobile-nav';
import { MobileNavService } from './mobile-nav.service';

describe('MobileNav', () => {
  let html: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    html = TestBed.inject(DOCUMENT).documentElement;
    html.style.overflow = 'scroll';
  });

  afterEach(() => {
    html.style.overflow = '';
  });

  it('bloquea el scroll de la página al abrir y lo restaura al cerrar', async () => {
    const fixture = TestBed.createComponent(MobileNav);
    const nav = TestBed.inject(MobileNavService);
    await fixture.whenStable();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;

    nav.open();
    await fixture.whenStable();
    expect(html.style.overflow).toBe('hidden');
    expect(dialog.open).toBe(true);

    nav.close();
    await fixture.whenStable();
    expect(html.style.overflow).toBe('scroll');
    expect(dialog.open).toBe(false);
  });

  it('restaura el scroll si se destruye estando abierto', async () => {
    const fixture = TestBed.createComponent(MobileNav);
    TestBed.inject(MobileNavService).open();
    await fixture.whenStable();
    expect(html.style.overflow).toBe('hidden');

    fixture.destroy();
    expect(html.style.overflow).toBe('scroll');
  });

  it('se cierra con un clic en el fondo, pero no con un clic dentro del panel', async () => {
    const fixture = TestBed.createComponent(MobileNav);
    const nav = TestBed.inject(MobileNavService);
    nav.open();
    await fixture.whenStable();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;

    dialog.querySelector('nav')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(nav.isOpen()).toBe(true);

    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(nav.isOpen()).toBe(false);
  });
});
