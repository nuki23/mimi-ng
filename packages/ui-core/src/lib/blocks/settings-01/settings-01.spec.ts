import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  SETTINGS_01_PLAN,
  Settings01,
  type Settings01Tab,
  type Settings01Value,
} from './settings-01';

@Component({
  imports: [Settings01],
  template: `<mimi-settings-01
    class="bg-muted"
    [(tab)]="tab"
    [saving]="saving()"
    (saved)="saved.push($event)"
    (avatarChange)="events.push('avatarChange')"
    (avatarRemove)="events.push('avatarRemove')"
    (sessionEnd)="events.push('sessionEnd:' + $event)"
    (deleteAccount)="events.push('deleteAccount')"
    (changePlan)="events.push('changePlan')"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tab = signal<Settings01Tab>('profile');
  readonly saving = signal(false);
  readonly saved: Settings01Value[] = [];
  readonly events: string[] = [];
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

/** settings-01 (B.6). */
describe('Settings01', { timeout: 20_000 }, () => {
  afterEach(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    document.querySelectorAll('ng-component').forEach((n) => n.remove());
  });

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const q = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const byLabel = (text: string) => {
      const label = [...el.querySelectorAll('label')].find((l) => l.textContent?.trim() === text)!;
      return document.getElementById(label.getAttribute('for')!)!;
    };
    const type = async (label: string, value: string) => {
      const input = byLabel(label) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    const button = (text: string) =>
      [...el.querySelectorAll<HTMLButtonElement>('button')].find(
        (b) => b.textContent?.trim() === text,
      )!;
    const bar = () => q('[role="status"]');
    const tab = (value: string) => q<HTMLButtonElement>(`[role="tab"][data-value="${value}"]`);
    const key = async (key: string) => {
      (document.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
      );
      await settle(fixture);
    };
    return {
      fixture,
      el,
      q,
      byLabel,
      type,
      button,
      bar,
      tab,
      key,
      host: fixture.componentInstance,
    };
  }

  it('las cuatro secciones; con el teclado en vertical (↑/↓)', async () => {
    const { tab, key, host, el } = await setup();
    expect(el.querySelector('[role="tablist"]')?.getAttribute('aria-orientation')).toBe('vertical');
    tab('profile').focus();
    await key('ArrowDown');
    expect(host.tab()).toBe('notifications');
    expect(el.textContent).toContain('Weekly summary');
    await key('ArrowDown');
    expect(host.tab()).toBe('security');
    expect(el.textContent).toContain('Two-step verification');
    await key('End');
    expect(host.tab()).toBe('billing');
    expect(el.textContent).toContain('Current plan');
  });

  it('en móvil (menos de 768px): píldoras horizontales con ←/→', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    try {
      const { tab, key, host, el } = await setup();
      const list = el.querySelector('[role="tablist"]')!;
      expect(list.getAttribute('aria-orientation')).toBe('horizontal');
      tab('profile').focus();
      await key('ArrowRight');
      expect(host.tab()).toBe('notifications');
      await key('ArrowDown');
      expect(host.tab()).toBe('notifications');
    } finally {
      window.matchMedia = original;
    }
  });

  it('«con cambios» aparece al cambiar un valor y desaparece al volver al original', async () => {
    const { type, bar, q } = await setup();
    expect(bar().textContent?.trim()).toBe('');
    await type('Name', 'New name');
    expect(bar().textContent).toContain('You have unsaved changes');
    expect(q('mimi-settings-01').getAttribute('data-state')).toBe('changed');
    await type('Name', 'Your name');
    expect(bar().textContent?.trim()).toBe('');
  });

  it('un interruptor cuenta como cambio; Descartar restaura', async () => {
    const { byLabel, fixture, bar, button } = await setup();
    const sounds = byLabel('Sounds');
    expect(sounds.getAttribute('aria-checked')).toBe('false');
    sounds.click();
    await settle(fixture);
    expect(bar().textContent).toContain('You have unsaved changes');
    button('Discard').click();
    await settle(fixture);
    expect(byLabel('Sounds').getAttribute('aria-checked')).toBe('false');
    expect(bar().textContent?.trim()).toBe('');
  });

  it('Guardar emite el valor y quita la barra', async () => {
    const { type, button, bar, host } = await setup();
    await type('Name', 'New name');
    button('Save').click();
    await new Promise((r) => setTimeout(r));
    expect(host.saved).toHaveLength(1);
    expect(host.saved[0]).toMatchObject({
      name: 'New name',
      username: 'your-username',
      compact: true,
    });
    await type('Name', 'New name');
    expect(bar().textContent?.trim()).toBe('');
  });

  it('Guardar con un error no emite y lleva el foco al campo', async () => {
    const { type, button, host, byLabel, fixture } = await setup();
    await type('Username', 'Not Valid');
    button('Save').click();
    await settle(fixture);
    expect(host.saved).toEqual([]);
    expect(document.activeElement).toBe(byLabel('Username'));
  });

  it('M3: Guardar con un error desde OTRA sección vuelve a Perfil y enfoca el campo', async () => {
    const { type, button, host, byLabel, fixture, tab } = await setup();
    await type('Username', 'Not Valid');
    tab('billing').click();
    await settle(fixture);
    expect(host.tab()).toBe('billing');
    // El panel de Perfil no existe mientras se ve otra sección (contenido diferido de Tabs).
    expect(document.body.textContent).not.toContain('Public profile');
    button('Save').click();
    await settle(fixture);
    expect(host.saved).toEqual([]);
    expect(host.tab()).toBe('profile');
    expect(document.activeElement).toBe(byLabel('Username'));
  });

  it('el contador de la biografía describe el campo', async () => {
    const { byLabel, type, el } = await setup();
    const bio = byLabel('Bio') as HTMLTextAreaElement;
    const counter = document.getElementById(bio.getAttribute('aria-describedby')!.split(' ')[0])!;
    expect(counter.textContent).toBe(`${bio.value.length}/160`);
    expect(counter.getAttribute('aria-live')).toBeNull();
    await type('Bio', 'Hola');
    expect(counter.textContent).toBe('4/160');
    void el;
  });

  it('cada interruptor: su título lo nombra y su descripción lo describe', async () => {
    const { byLabel } = await setup();
    const compact = byLabel('Compact mode');
    const desc = document.getElementById(compact.getAttribute('aria-describedby')!);
    expect(desc?.textContent?.trim()).toBe('Denser tables and lists.');
  });

  it('las salidas de foto, sesiones, borrar y plan', async () => {
    const { button, host, fixture, tab } = await setup();
    button('Change photo').click();
    button('Remove').click();
    tab('security').click();
    await settle(fixture);
    button('Sign out').click();
    button('Delete account').click();
    tab('billing').click();
    await settle(fixture);
    button('Change plan').click();
    expect(host.events).toEqual([
      'avatarChange',
      'avatarRemove',
      'sessionEnd:iphone',
      'deleteAccount',
      'changePlan',
    ]);
  });

  it('facturación: precio con Intl y la barra de asientos con su nombre', async () => {
    const { tab, fixture, el, q } = await setup();
    tab('billing').click();
    await settle(fixture);
    expect(el.textContent).toContain('Team · $12 per seat');
    expect(el.textContent).toContain('next invoice on November 1');
    const progress = q('[role="progressbar"]');
    expect(progress.getAttribute('aria-valuenow')).toBe(String(SETTINGS_01_PLAN.seatsUsed));
    expect(document.getElementById(progress.getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Seats used',
    );
  });

  it('un h1 y class del usuario', async () => {
    const { el, q } = await setup();
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    expect(q('mimi-settings-01').classList).toContain('bg-muted');
    expect(q('mimi-settings-01').classList).not.toContain('bg-background');
  });
});
