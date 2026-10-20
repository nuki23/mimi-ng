import { Directionality } from '@angular/cdk/bidi';
import { Component, EventEmitter, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MimiToolbar,
  MimiToolbarCount,
  MimiToolbarImports,
  type MimiToolbarOrientation,
} from './toolbar';

@Component({
  imports: [MimiToolbarImports],
  template: `
    <button data-test="before">Antes</button>
    <mimi-toolbar
      aria-label="Formato"
      [orientation]="orientation()"
      [wrap]="wrap()"
      [(value)]="value"
      [(pressed)]="pressed"
      (activate)="log.push($event)"
      [class]="extra()"
    >
      <button mimiToolbarItem="bold" kind="toggle" aria-label="Negrita">B</button>
      <button mimiToolbarItem="italic" kind="toggle" aria-label="Cursiva">I</button>
      <mimi-toolbar-separator />
      <button mimiToolbarItem="left" kind="tool" aria-label="Izquierda" [class]="itemClass()">
        L
      </button>
      <button mimiToolbarItem="center" kind="tool" aria-label="Centro">C</button>
      <button mimiToolbarItem="link" aria-label="Enlace" (click)="clicks.push('link')">K</button>
      <button mimiToolbarItem="off" aria-label="Apagado" disabled (click)="clicks.push('off')">
        X
      </button>
      <button mimiToolbarItem="save" type="submit" aria-label="Guardar">S</button>
      @if (more()) {
        <button mimiToolbarItem="more" aria-label="Más">M</button>
      }
      <input data-test="field" aria-label="Buscar" />
    </mimi-toolbar>
    <button data-test="after">Después</button>
  `,
})
class Host {
  readonly orientation = signal<MimiToolbarOrientation>('horizontal');
  readonly wrap = signal(true);
  readonly value = signal<string | undefined>(undefined);
  readonly pressed = signal<string[]>([]);
  readonly extra = signal('');
  readonly itemClass = signal('');
  readonly more = signal(false);
  readonly log: string[] = [];
  readonly clicks: string[] = [];
}

@Component({
  imports: [MimiToolbarImports],
  template: `
    <mimi-toolbar [aria-label]="label()">
      <button mimiToolbarItem="a">A</button>
      <button mimiToolbarItem="b"><svg aria-hidden="true"></svg></button>
      <button mimiToolbarItem="b" aria-label="Comentarios">
        <span mimiToolbarCount>3</span>
      </button>
    </mimi-toolbar>
  `,
})
class WarnHost {
  readonly label = signal('');
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const KEY_CODES: Record<string, number> = {
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Home: 36,
  End: 35,
  Tab: 9,
};

describe('MimiToolbar', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const toolbar = root.querySelector<HTMLElement>('mimi-toolbar')!;
    const item = (value: string) =>
      root.querySelector<HTMLButtonElement>(`[mimiToolbarItem="${value}"]`)!;
    const stops = () =>
      Array.from(toolbar.querySelectorAll<HTMLElement>('[mimiToolbarItem]'))
        .filter((b) => b.getAttribute('tabindex') === '0')
        .map((b) => b.getAttribute('mimiToolbarItem'));
    const key = async (key: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key,
        keyCode: KEY_CODES[key],
        bubbles: true,
        cancelable: true,
        ...init,
      } as KeyboardEventInit);
      (document.activeElement as HTMLElement).dispatchEvent(event);
      await settle(fixture);
      return event;
    };
    const focused = () => document.activeElement?.getAttribute('mimiToolbarItem');
    return { fixture, h: fixture.componentInstance, root, toolbar, item, stops, key, focused };
  }

  it('roles, nombre, orientación, separador y atributos de los botones', async () => {
    const { toolbar, item, stops } = await setup();
    expect(toolbar.getAttribute('role')).toBe('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Formato');
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar.dataset['orientation']).toBe('horizontal');
    const separator = toolbar.querySelector('mimi-toolbar-separator')!;
    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
    expect(item('bold').type).toBe('button');
    // El type del usuario gana.
    expect(item('save').getAttribute('type')).toBe('submit');
    expect(item('bold').getAttribute('aria-pressed')).toBe('false');
    expect(item('left').getAttribute('aria-pressed')).toBe('false');
    expect(item('link').hasAttribute('aria-pressed')).toBe(false);
    expect(item('left').dataset['kind']).toBe('tool');
    expect(item('link').dataset['kind']).toBe('action');
    expect(item('link').dataset['state']).toBe('idle');
    // Una sola parada de Tab: el primero.
    expect(stops()).toEqual(['bold']);
  });

  it('deshabilitado: sin disabled nativo (también estático), aria-disabled y data-disabled', async () => {
    const { item } = await setup();
    expect(item('off').hasAttribute('disabled')).toBe(false);
    expect(item('off').getAttribute('aria-disabled')).toBe('true');
    expect(item('off').dataset['disabled']).toBe('');
    expect(item('link').hasAttribute('data-disabled')).toBe(false);
  });

  it('flechas horizontales con vuelta, Inicio y Fin; ↑↓ y con modificadores, nada', async () => {
    const { item, key, focused, stops } = await setup();
    item('bold').focus();
    await key('ArrowRight');
    expect(focused()).toBe('italic');
    expect(stops()).toEqual(['italic']);
    await key('ArrowRight');
    expect(focused()).toBe('left');
    await key('ArrowLeft');
    await key('ArrowLeft');
    expect(focused()).toBe('bold');
    await key('ArrowLeft');
    expect(focused()).toBe('save');
    await key('ArrowRight');
    expect(focused()).toBe('bold');
    await key('End');
    expect(focused()).toBe('save');
    await key('Home');
    expect(focused()).toBe('bold');
    await key('ArrowDown');
    expect(focused()).toBe('bold');
    const ctrl = await key('ArrowRight', { ctrlKey: true });
    expect(focused()).toBe('bold');
    expect(ctrl.defaultPrevented).toBe(false);
    // Tab no se cancela: sale de la toolbar con el navegador.
    expect((await key('Tab')).defaultPrevented).toBe(false);
  });

  it('el deshabilitado se enfoca con las flechas', async () => {
    const { item, key, focused } = await setup();
    item('link').focus();
    await key('ArrowRight');
    expect(focused()).toBe('off');
  });

  it('sin vuelta, se queda en el último', async () => {
    const { fixture, h, item, key, focused } = await setup();
    h.wrap.set(false);
    await settle(fixture);
    item('save').focus();
    await key('ArrowRight');
    expect(focused()).toBe('save');
  });

  it('vertical (también en caliente): ↑↓ mueven, ←→ no; el separador pasa a horizontal', async () => {
    const { fixture, h, toolbar, item, key, focused } = await setup();
    h.orientation.set('vertical');
    await settle(fixture);
    expect(toolbar.getAttribute('aria-orientation')).toBe('vertical');
    expect(toolbar.querySelector('mimi-toolbar-separator')!.getAttribute('aria-orientation')).toBe(
      'horizontal',
    );
    item('bold').focus();
    await key('ArrowDown');
    expect(focused()).toBe('italic');
    await key('ArrowRight');
    expect(focused()).toBe('italic');
    await key('ArrowUp');
    expect(focused()).toBe('bold');
  });

  it('foco por clic o por código: las flechas siguen desde ahí y el tabindex lo sigue', async () => {
    const { fixture, item, key, focused, stops } = await setup();
    item('center').focus();
    await settle(fixture);
    expect(stops()).toEqual(['center']);
    await key('ArrowRight');
    expect(focused()).toBe('link');
    item('bold').focus();
    item('bold').blur();
    await settle(fixture);
    // Recuerda el último.
    expect(stops()).toEqual(['bold']);
  });

  it('herramienta: elige y volver a elegirla no la desmarca; interruptor alterna; acción solo avisa', async () => {
    const { fixture, h, item } = await setup();
    item('left').click();
    await settle(fixture);
    expect(h.value()).toBe('left');
    expect(item('left').getAttribute('aria-pressed')).toBe('true');
    expect(item('left').dataset['state']).toBe('active');
    item('left').click();
    await settle(fixture);
    expect(h.value()).toBe('left');
    item('center').click();
    await settle(fixture);
    expect(h.value()).toBe('center');
    expect(item('left').getAttribute('aria-pressed')).toBe('false');
    item('bold').click();
    item('italic').click();
    await settle(fixture);
    expect(h.pressed()).toEqual(['bold', 'italic']);
    expect(item('bold').dataset['state']).toBe('pressed');
    item('bold').click();
    await settle(fixture);
    expect(h.pressed()).toEqual(['italic']);
    expect(item('bold').getAttribute('aria-pressed')).toBe('false');
    item('link').click();
    await settle(fixture);
    expect(h.log).toEqual(['left', 'left', 'center', 'bold', 'italic', 'bold', 'link']);
    expect(h.clicks).toEqual(['link']);
  });

  it('deshabilitado: el clic se frena antes del (click) del usuario y de activate', async () => {
    const { fixture, h, item } = await setup();
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    item('off').dispatchEvent(event);
    await settle(fixture);
    expect(event.defaultPrevented).toBe(true);
    expect(h.clicks).toEqual([]);
    expect(h.log).toEqual([]);
  });

  it('el clic activa (y lo marca como activo del gestor)', async () => {
    const { fixture, item, stops } = await setup();
    item('center').click();
    await settle(fixture);
    expect(stops()).toEqual(['center']);
  });

  it('valor y presionados desde fuera; un valor sin botón se conserva', async () => {
    const { fixture, h, item } = await setup();
    h.value.set('center');
    h.pressed.set(['italic']);
    await settle(fixture);
    expect(item('center').dataset['state']).toBe('active');
    expect(item('italic').dataset['state']).toBe('pressed');
    h.value.set('right');
    await settle(fixture);
    expect(h.value()).toBe('right');
    expect(item('center').dataset['state']).toBe('idle');
  });

  it('botones que aparecen y se quitan; quitar el activo pasa el tabindex al primero', async () => {
    const { fixture, h, item, key, focused, stops } = await setup();
    h.more.set(true);
    await settle(fixture);
    item('bold').focus();
    await key('End');
    expect(focused()).toBe('more');
    h.more.set(false);
    await settle(fixture);
    expect(stops()).toEqual(['bold']);
    item('bold').focus();
    await key('ArrowRight');
    expect(focused()).toBe('italic');
  });

  it('las teclas de un campo dentro de la toolbar no las toma el gestor', async () => {
    const { root, key } = await setup();
    const field = root.querySelector<HTMLInputElement>('[data-test=field]')!;
    field.focus();
    const event = await key('ArrowRight');
    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(field);
  });

  it('class gana en la píldora y en el botón; tokens con respaldo', async () => {
    const { fixture, h, toolbar, item } = await setup();
    for (const cls of [
      'p-[6px]',
      'gap-[6px]',
      'rounded-full',
      'bg-[color:var(--mimi-toolbar-bg,var(--mimi-glass))]',
      'border-[color:var(--mimi-toolbar-border,var(--mimi-glass-border))]',
      'backdrop-blur-[var(--mimi-toolbar-blur,var(--mimi-glass-blur))]',
      'backdrop-saturate-[1.4]',
      'shadow-[shadow:var(--mimi-toolbar-shadow,var(--mimi-shadow-popover))]',
    ]) {
      expect(toolbar.classList).toContain(cls);
    }
    for (const cls of [
      'size-[var(--mimi-toolbar-item-size,40px)]',
      'data-[state=active]:bg-[color:var(--mimi-toolbar-active-bg,var(--mimi-primary))]',
      'data-[state=active]:text-[color:var(--mimi-toolbar-active-fg,var(--mimi-primary-foreground))]',
      'data-[state=pressed]:bg-[color:var(--mimi-toolbar-pressed-bg,var(--mimi-accent))]',
      'not-aria-disabled:active:scale-(--mimi-press-scale-sm)',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-4',
    ]) {
      expect(item('left').classList).toContain(cls);
    }
    expect(item('left').classList).not.toContain('focus-visible:outline-offset-2');
    h.extra.set('p-2');
    h.itemClass.set('size-9');
    await settle(fixture);
    expect(toolbar.classList).toContain('p-2');
    expect(toolbar.classList).not.toContain('p-[6px]');
    expect(item('left').classList).toContain('size-9');
    expect(item('left').classList).not.toContain('size-[var(--mimi-toolbar-item-size,40px)]');
  });

  it('el contador es decorativo', async () => {
    @Component({
      imports: [MimiToolbarImports],
      template: `<mimi-toolbar aria-label="T">
        <button mimiToolbarItem="c" aria-label="Comentarios, 3 sin leer">
          <span mimiToolbarCount>3</span>
        </button>
      </mimi-toolbar>`,
    })
    class CountHost {}
    const fixture = TestBed.createComponent(CountHost);
    await settle(fixture);
    const count = (fixture.nativeElement as HTMLElement).querySelector('[mimiToolbarCount]')!;
    expect(count.getAttribute('aria-hidden')).toBe('true');
    expect(count.classList).toContain('bg-info');
    expect(count.classList).toContain('-end-[3px]');
    expect(MimiToolbarCount).toBeDefined();
  });

  it('avisa en desarrollo (una vez): sin nombre, sin aria-label, repetidos y contador', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(WarnHost);
    await settle(fixture);
    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0][0]);
    expect(message).toContain('la toolbar no tiene aria-label');
    expect(message).toContain('hay valores repetidos');
    expect(message).toContain('un botón sin texto visible no tiene aria-label');
    expect(message).toContain('no incluye el número');
    fixture.componentInstance.label.set('Otro');
    await settle(fixture);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('sin avisos con nombre y botones con nombre', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await setup();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('MimiToolbar en derecha a izquierda', () => {
  it('← avanza y → retrocede', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Directionality,
          useValue: { value: 'rtl', valueSignal: signal('rtl'), change: new EventEmitter() },
        },
      ],
    });
    @Component({
      imports: [MimiToolbarImports],
      template: `<mimi-toolbar aria-label="T">
        <button mimiToolbarItem="a" aria-label="A">A</button>
        <button mimiToolbarItem="b" aria-label="B">B</button>
      </mimi-toolbar>`,
    })
    class RtlHost {}
    const fixture = TestBed.createComponent(RtlHost);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLElement>('[mimiToolbarItem="a"]')!.focus();
    root.querySelector<HTMLElement>('[mimiToolbarItem="a"]')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        keyCode: 37,
        bubbles: true,
      } as KeyboardEventInit),
    );
    await settle(fixture);
    expect(document.activeElement?.getAttribute('mimiToolbarItem')).toBe('b');
    expect(MimiToolbar).toBeDefined();
    (document.activeElement as HTMLElement).blur();
  });
});
