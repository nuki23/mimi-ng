import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiChip, injectMimiChipAnnouncer } from './chip';
import { MIMI_CHIP_TEXT_ES, provideMimiChipText } from './chip-texts';

@Component({
  imports: [MimiChip],
  template: `<mimi-chip
    label="angular"
    [removable]="removable()"
    [invalid]="bad()"
    [class]="extra()"
    (remove)="removed = removed + 1"
    >angular</mimi-chip
  >`,
})
class Host {
  readonly removable = signal(true);
  readonly bad = signal(false);
  readonly extra = signal('');
  removed = 0;
  readonly announcer = injectMimiChipAnnouncer();
}

describe('MimiChip', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const chip = () =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('mimi-chip')!;
    const button = () => chip().querySelector<HTMLButtonElement>('[data-slot="remove"]');
    return { fixture, host: fixture.componentInstance, chip, button };
  }

  it('botón de quitar con nombre, que emite remove', async () => {
    const { host, button } = await setup();
    expect(button()!.getAttribute('aria-label')).toBe('Remove angular');
    expect(button()!.getAttribute('type')).toBe('button');
    button()!.click();
    expect(host.removed).toBe(1);
  });

  it('sin removable no hay botón; invalid pinta el tono de error; class gana', async () => {
    const { fixture, host, chip, button } = await setup();
    expect(chip().className).toContain('--mimi-chip,var(--mimi-secondary)');
    host.removable.set(false);
    host.bad.set(true);
    host.extra.set('h-8');
    await fixture.whenStable();
    expect(button()).toBeNull();
    expect(chip().className).toContain('bg-destructive-soft-bg');
    expect(chip().className).toContain('h-8');
    expect(chip().className).not.toContain('h-[var(--mimi-chip-height');
  });

  it('anuncios de agregar y quitar en polite', async () => {
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue();
    const { host } = await setup();
    host.announcer.added('angular');
    host.announcer.removed('angular');
    expect(announce).toHaveBeenNthCalledWith(1, 'angular added', 'polite');
    expect(announce).toHaveBeenNthCalledWith(2, 'angular removed', 'polite');
  });

  it('textos en español', async () => {
    TestBed.configureTestingModule({ providers: [provideMimiChipText(MIMI_CHIP_TEXT_ES)] });
    const { button } = await setup();
    expect(button()!.getAttribute('aria-label')).toBe('Quitar angular');
  });
});
