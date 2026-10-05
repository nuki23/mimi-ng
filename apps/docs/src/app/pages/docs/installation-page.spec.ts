import { TestBed } from '@angular/core/testing';
import { HighlighterService } from '../../code/highlighter.service';
import { InstallationPage } from './installation-page';

describe('InstallationPage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(InstallationPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const commands = Array.from(el.querySelectorAll('app-code-block pre')).map((pre) =>
      pre.textContent?.trim(),
    );
    return { el, commands };
  }

  it('sigue el recorrido real de la CLI', async () => {
    const { el } = await setup();
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'requirements',
      'install',
      'add',
      'use',
      'files',
      'updates',
      'pnpm',
    ]);
    // La CLI ya está publicada en npm (tarea L.6).
    expect(el.textContent).not.toContain('disponible pronto');
  });

  it('muestra los comandos que existen hoy', async () => {
    const { commands } = await setup();
    for (const command of [
      'ng new mi-app --style=tailwind',
      'ng add @mimi-ng/cli',
      'ng add @mimi-ng/cli --icons',
      'ng g mimi button',
      'ng g mimi button input card',
      'ng g mimi',
      'ng g @mimi-ng/cli:ui button',
      'ng g mimi button --overwrite',
      'pnpm approve-builds',
    ]) {
      expect(commands, command).toContain(command);
    }
    expect(commands.join('\n')).not.toContain('mimi add');
  });

  it('pnpm: explica minimumReleaseAge solo con lo que dice su documentación (tarea 0.1.1-2)', async () => {
    const { el } = await setup();
    const heading = el.querySelector('h3#pnpm-release-age')!;
    expect(heading.textContent?.trim()).toBe('Versiones recién publicadas');
    const text = heading.nextElementSibling!.textContent!.replace(/\s+/g, ' ');
    expect(text).toContain('minimumReleaseAge vale 1440 minutos por defecto');
    expect(text).toContain('minimumReleaseAgeStrict');
    const link = heading.nextElementSibling!.querySelector('a')!;
    expect(link.getAttribute('href')).toBe(
      'https://pnpm.io/settings/dependency-resolution#minimumreleaseage',
    );
  });

  it('explica cuándo usar la forma larga, y que sin ng add no funciona ninguna', async () => {
    const { el } = await setup();
    const heading = el.querySelector('h3#add-long-form')!;
    expect(heading.textContent?.trim()).toBe('Cuándo usar la forma larga');
    const explanation = heading.nextElementSibling!.textContent!.replace(/\s+/g, ' ');
    expect(explanation).toContain('Si Mimi no está en esa lista');
    const block = heading.nextElementSibling!.nextElementSibling!;
    expect(block.textContent).toContain('ng g @mimi-ng/cli:ui button');
    const caveat = block.nextElementSibling!.textContent!.replace(/\s+/g, ' ');
    expect(caveat).toContain('ninguna de las dos funciona');
  });

  it('mimi update está marcado como versión futura', async () => {
    const { el } = await setup();
    const section = el.querySelector('h3#update')!;
    const badge = section.nextElementSibling!;
    expect(badge.textContent).toContain('Versión futura');
    expect(el.textContent).toContain('pnpm mimi update button');
  });

  it('explica qué modifica ng add y por qué .mimi/ va en git', async () => {
    const { el } = await setup();
    const files = Array.from(el.querySelectorAll('tbody td:first-child')).map((td) =>
      td.textContent?.trim(),
    );
    expect(files).toEqual([
      'src/styles.css',
      'tsconfig.json',
      'angular.json',
      'package.json',
      'src/app/components/ui/',
      'mimi.json',
      '.mimi/',
    ]);
    expect(el.textContent).toContain('Guarda la carpeta .mimi/ en git');
    expect(el.textContent).toContain('ERR_PNPM_IGNORED_BUILDS');
  });
});
