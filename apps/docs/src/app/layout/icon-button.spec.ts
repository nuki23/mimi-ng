import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { buttonVariants } from '@/components/ui/button/button.variants';
import { cn } from '@/components/ui/utils/cn';
import { SITE_ICON_BUTTON_CLASSES } from './icon-button';
import { MobileNav } from './mobile-nav';
import { SiteHeader } from './site-header';

/** Las clases propias de los botones de la cabecera, las que tenían con `mimiBtn` (M.25). */
const HEADER_EXTRAS = 'size-9 rounded-[min(var(--mimi-radius),10px)] [&_svg]:size-[18px]';

// Las pruebas corren en Node (ver design-source.spec.ts).
const ibNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const ibFs = ibNode.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
};

const sorted = (value: string) => value.split(/\s+/).filter(Boolean).sort();

describe('SiteIconButton (M.25)', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  it('tiene las mismas clases que mimiBtn fantasma de ícono con las de la cabecera', () => {
    const expected = cn(
      buttonVariants({ variant: 'ghost', tone: 'secondary', size: 'icon' }),
      HEADER_EXTRAS,
    );
    expect(SITE_ICON_BUTTON_CLASSES).toBe(expected);
  });

  it('la cabecera y el menú móvil no usan Button (no lo traen a main)', () => {
    const dir = `${ibNode.cwd()}/apps/docs/src/app/layout`;
    for (const file of ['site-header.ts', 'site-header.html', 'mobile-nav.ts', 'mobile-nav.html']) {
      const text = ibFs.readFileSync(`${dir}/${file}`, 'utf8');
      expect(text, file).not.toMatch(/mimiBtn|MimiButton|components\/ui\/button|utils\/cn/);
    }
  });

  it('pinta los botones de la cabecera con sus clases y las propias de cada uno', async () => {
    const fixture = TestBed.createComponent(SiteHeader);
    await fixture.whenStable();
    const buttons = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[appIconBtn]'),
    ];
    expect(buttons.length).toBe(3);
    const [menu, github, theme] = buttons;
    expect(sorted(menu.className)).toEqual(sorted(`${SITE_ICON_BUTTON_CLASSES} -ml-2 lg:hidden`));
    expect(sorted(github.className)).toEqual(sorted(SITE_ICON_BUTTON_CLASSES));
    expect(sorted(theme.className)).toEqual(sorted(SITE_ICON_BUTTON_CLASSES));
    expect(menu.getAttribute('aria-label')).toBe('Abrir menú');
    expect(github.tagName).toBe('A');
  });

  it('el botón de cerrar del menú móvil también', async () => {
    const fixture = TestBed.createComponent(MobileNav);
    await fixture.whenStable();
    const close = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[appIconBtn]',
    )!;
    expect(close.getAttribute('aria-label')).toBe('Cerrar menú');
    expect(sorted(close.className)).toEqual(sorted(`${SITE_ICON_BUTTON_CLASSES} -mr-2`));
  });
});
