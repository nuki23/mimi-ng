import { Directionality } from '@angular/cdk/bidi';
import { Component, EventEmitter, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import {
  MimiToggleGroup,
  MimiToggleGroupImports,
  type MimiToggleGroupVariant,
} from './toggle-group';

@Component({
  imports: [MimiToggleGroupImports],
  template: `
    <button data-test="before">Antes</button>
    <mimi-toggle-group
      data-test="single"
      aria-label="Periodo"
      [(value)]="period"
      [disabled]="off()"
      [variant]="variant()"
      [class]="extra()"
    >
      <button mimiToggleGroupItem="d" [class]="itemClass()">Diario</button>
      <button mimiToggleGroupItem="s">Semanal</button>
      <button mimiToggleGroupItem="m">Mensual</button>
      <button mimiToggleGroupItem="a">Anual</button>
    </mimi-toggle-group>
    <button data-test="between">Entre</button>
    <mimi-toggle-group data-test="multi" aria-label="Formato" multiple [(value)]="format">
      <button mimiToggleGroupItem="bold" aria-label="Negrita">
        <svg aria-hidden="true"></svg>
      </button>
      <button mimiToggleGroupItem="italic" aria-label="Cursiva">
        <svg aria-hidden="true"></svg>
      </button>
      <button mimiToggleGroupItem="under" aria-label="Subrayado">
        <svg aria-hidden="true"></svg>
      </button>
    </mimi-toggle-group>
    <button data-test="after">Después</button>
  `,
})
class Host {
  readonly period = signal<string | null>('s');
  readonly format = signal<string[]>(['bold']);
  readonly off = signal(false);
  readonly variant = signal<MimiToggleGroupVariant>('default');
  readonly extra = signal('');
  readonly itemClass = signal('');
}

@Component({
  imports: [MimiToggleGroupImports, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <form [formGroup]="group">
      <mimi-toggle-group data-test="reactive" aria-label="R" formControlName="size">
        <button mimiToggleGroupItem="s">S</button>
        <button mimiToggleGroupItem="m">M</button>
      </mimi-toggle-group>
      <mimi-toggle-group data-test="reactive-multi" aria-label="RM" multiple formControlName="tags">
        <button mimiToggleGroupItem="a">A</button>
        <button mimiToggleGroupItem="b">B</button>
      </mimi-toggle-group>
    </form>
    <mimi-toggle-group data-test="signal" aria-label="S" [formField]="signalForm.size">
      <button mimiToggleGroupItem="s">S</button>
      <button mimiToggleGroupItem="m">M</button>
    </mimi-toggle-group>
    <mimi-toggle-group
      data-test="signal-multi"
      aria-label="SM"
      multiple
      [formField]="signalForm.tags"
    >
      <button mimiToggleGroupItem="a">A</button>
      <button mimiToggleGroupItem="b">B</button>
    </mimi-toggle-group>
    <mimi-toggle-group data-test="ng-model" aria-label="N" name="n" [(ngModel)]="model">
      <button mimiToggleGroupItem="s">S</button>
      <button mimiToggleGroupItem="m">M</button>
    </mimi-toggle-group>
    <mimi-toggle-group
      data-test="ng-model-multi"
      aria-label="NM"
      name="nm"
      multiple
      [(ngModel)]="modelMulti"
    >
      <button mimiToggleGroupItem="a">A</button>
      <button mimiToggleGroupItem="b">B</button>
    </mimi-toggle-group>
    <button data-test="out">Fuera</button>
  `,
})
class FormsHost {
  readonly group = new FormGroup({
    size: new FormControl<string | null>(null, Validators.required),
    tags: new FormControl<string[]>([], { nonNullable: true }),
  });
  readonly locked = signal(false);
  readonly data = signal<{ size: string | null; tags: string[] }>({ size: null, tags: [] });
  readonly signalForm = form(this.data, (p) => {
    required(p.size);
    disabled(p.size, () => this.locked());
  });
  model: string | null = 'm';
  modelMulti: string[] = ['b'];
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
};

const press = (target: Element, key: string, init: KeyboardEventInit = {}) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      keyCode: KEY_CODES[key],
      bubbles: true,
      cancelable: true,
      ...init,
    } as KeyboardEventInit),
  );

describe('MimiToggleGroup', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const group = (name: string) => root.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const item = (value: string) =>
      root.querySelector<HTMLButtonElement>(`[mimiToggleGroupItem="${value}"]`)!;
    const indicator = () => group('single').querySelector<HTMLElement>('[data-slot="indicator"]')!;
    return { fixture, host: fixture.componentInstance, root, group, item, indicator };
  }

  it('simple: radiogroup con radios, aria-checked y data-state', async () => {
    const { group, item } = await setup();
    expect(group('single').getAttribute('role')).toBe('radiogroup');
    expect(group('single').getAttribute('aria-label')).toBe('Periodo');
    expect(item('d').getAttribute('role')).toBe('radio');
    expect(item('s').getAttribute('aria-checked')).toBe('true');
    expect(item('d').getAttribute('aria-checked')).toBe('false');
    expect(item('s').getAttribute('data-state')).toBe('on');
    expect(item('d').getAttribute('data-state')).toBe('off');
    expect(item('d').getAttribute('aria-pressed')).toBeNull();
    expect(item('d').getAttribute('type')).toBe('button');
  });

  it('simple: una sola parada de Tab, en el elegido; sin elegido, en el primero', async () => {
    const { fixture, host, item } = await setup();
    const stops = () => ['d', 's', 'm', 'a'].filter((v) => item(v).tabIndex === 0);
    expect(stops()).toEqual(['s']);
    expect(item('d').getAttribute('tabindex')).toBe('-1');
    host.period.set(null);
    await settle(fixture);
    expect(stops()).toEqual(['d']);
  });

  it('simple: el clic elige y volver a pulsar el elegido no lo quita', async () => {
    const { fixture, host, item } = await setup();
    item('m').click();
    await settle(fixture);
    expect(host.period()).toBe('m');
    item('m').click();
    await settle(fixture);
    expect(host.period()).toBe('m');
  });

  it('simple: las flechas mueven el foco y eligen, con vuelta', async () => {
    const { fixture, host, item } = await setup();
    item('s').focus();
    press(item('s'), 'ArrowRight');
    await settle(fixture);
    expect(document.activeElement).toBe(item('m'));
    expect(host.period()).toBe('m');
    press(item('m'), 'ArrowDown');
    await settle(fixture);
    expect(host.period()).toBe('a');
    press(item('a'), 'ArrowRight');
    await settle(fixture);
    expect(document.activeElement).toBe(item('d'));
    expect(host.period()).toBe('d');
    press(item('d'), 'ArrowLeft');
    await settle(fixture);
    expect(host.period()).toBe('a');
    press(item('a'), 'ArrowUp');
    await settle(fixture);
    expect(host.period()).toBe('m');
    expect(item('m').tabIndex).toBe(0);
  });

  it('simple: con modificadores, las flechas no hacen nada', async () => {
    const { fixture, host, item } = await setup();
    item('s').focus();
    press(item('s'), 'ArrowRight', { shiftKey: true });
    await settle(fixture);
    expect(host.period()).toBe('s');
  });

  it('el indicador se alinea al elegido (clic, teclado y valor desde fuera)', async () => {
    const { fixture, host, group, item, indicator } = await setup();
    const index = () => group('single').style.getPropertyValue('--mimi-toggle-group-index');
    expect(group('single').style.getPropertyValue('--mimi-toggle-group-count')).toBe('4');
    expect(index()).toBe('1');
    expect(indicator().hidden).toBe(false);
    item('a').click();
    await settle(fixture);
    expect(index()).toBe('3');
    item('a').focus();
    press(item('a'), 'ArrowRight');
    await settle(fixture);
    expect(index()).toBe('0');
    host.period.set('m');
    await settle(fixture);
    expect(index()).toBe('2');
    host.period.set(null);
    await settle(fixture);
    expect(indicator().hidden).toBe(true);
  });

  it('un valor sin botón se conserva (no pasa a null) y no pinta indicador', async () => {
    const { fixture, host, indicator, item } = await setup();
    host.period.set('x');
    await settle(fixture);
    expect(host.period()).toBe('x');
    expect(indicator().hidden).toBe(true);
    expect(item('d').tabIndex).toBe(0);
  });

  it('el indicador no se anima con movimiento reducido y usa la curva de su token', async () => {
    const { indicator } = await setup();
    expect(indicator().className).toContain('motion-reduce:transition-none');
    expect(indicator().style.transitionTimingFunction).toContain('--mimi-toggle-group-spring');
  });

  it('el indicador mide una columna y se desplaza un ancho más una separación por ítem', async () => {
    const { indicator } = await setup();
    const style = indicator().style;
    expect(style.width).toContain('var(--mimi-toggle-group-count)');
    expect(style.width).toContain('var(--mimi-toggle-group-padding, 3px)');
    expect(style.translate).toContain('calc(1 * var(--mimi-toggle-group-index)');
    expect(style.translate).toContain('var(--mimi-toggle-group-gap, 2px)');
    expect(indicator().className).toContain('bg-[color:var(--mimi-toggle-group-indicator');
  });

  it('múltiple: cada elegido lleva el fondo del indicador; sin elegir, transparente', async () => {
    const { item } = await setup();
    expect(item('bold').className).toContain('bg-[color:var(--mimi-toggle-group-indicator');
    expect(item('bold').className).toContain('font-semibold');
    expect(item('italic').className).toContain('bg-transparent');
    expect(item('italic').className).not.toContain('font-semibold');
  });

  it('múltiple: group con aria-pressed, todos son paradas de Tab y el clic alterna', async () => {
    const { fixture, host, group, item } = await setup();
    expect(group('multi').getAttribute('role')).toBe('group');
    expect(group('multi').querySelector('[data-slot="indicator"]')).toBeNull();
    expect(item('bold').getAttribute('aria-pressed')).toBe('true');
    expect(item('italic').getAttribute('aria-pressed')).toBe('false');
    expect(item('bold').getAttribute('role')).toBeNull();
    expect(item('bold').getAttribute('tabindex')).toBeNull();
    item('italic').click();
    await settle(fixture);
    expect(host.format()).toEqual(['bold', 'italic']);
    item('bold').click();
    await settle(fixture);
    expect(host.format()).toEqual(['italic']);
  });

  it('múltiple: las flechas no mueven el foco ni eligen', async () => {
    const { fixture, host, item } = await setup();
    item('bold').focus();
    press(item('bold'), 'ArrowRight');
    await settle(fixture);
    expect(document.activeElement).toBe(item('bold'));
    expect(host.format()).toEqual(['bold']);
  });

  it('deshabilitado: botones nativos deshabilitados, aria-disabled y data-disabled', async () => {
    const { fixture, host, group, item } = await setup();
    host.off.set(true);
    await settle(fixture);
    expect(group('single').getAttribute('aria-disabled')).toBe('true');
    expect(group('single').hasAttribute('data-disabled')).toBe(true);
    expect(item('d').disabled).toBe(true);
    item('d').click();
    await settle(fixture);
    expect(host.period()).toBe('s');
  });

  it('variant solid: data-variant en el grupo, el indicador y los ítems', async () => {
    const { fixture, host, group, item, indicator } = await setup();
    expect(group('single').getAttribute('data-variant')).toBe('default');
    host.variant.set('solid');
    await settle(fixture);
    expect(group('single').getAttribute('data-variant')).toBe('solid');
    expect(indicator().getAttribute('data-variant')).toBe('solid');
    expect(item('s').getAttribute('data-variant')).toBe('solid');
    expect(indicator().className).toContain('bg-primary');
    expect(indicator().className).toContain('shadow-primary');
    expect(item('s').className).toContain('text-primary-foreground');
    expect(item('d').className).not.toContain('text-primary-foreground');
  });

  it('class del usuario: gana en el grupo y en el ítem (cn con tipo en los var())', async () => {
    const { fixture, host, group, item } = await setup();
    host.extra.set('bg-card p-1 gap-1 rounded-none');
    host.itemClass.set('h-10 px-4 text-sm text-foreground rounded-sm');
    await settle(fixture);
    const g = group('single').className;
    expect(g).toContain('bg-card');
    expect(g).not.toContain('bg-[color:var(--mimi-toggle-group-bg');
    expect(g).not.toContain('p-[var(--mimi-toggle-group-padding');
    expect(g).not.toContain('gap-[var(--mimi-toggle-group-gap');
    expect(g).not.toContain('rounded-[calc(');
    const i = item('d').className;
    expect(i).toContain('h-10');
    expect(i).not.toContain('h-[var(--mimi-toggle-group-item-height');
    expect(i).not.toContain('px-[var(--mimi-toggle-group-item-px');
    expect(i).not.toContain('text-[length:var(--mimi-toggle-group-font-size');
    expect(i).not.toContain('text-[color:var(--mimi-toggle-group-fg');
    expect(i).not.toContain('rounded-[var(--mimi-toggle-group-radius');
  });

  it('el foco visible no lleva outline-none (anularía el anillo)', async () => {
    const { item } = await setup();
    expect(item('d').className).toContain('focus-visible:outline-2');
    expect(item('d').className).not.toContain('outline-none');
  });

  it('avisa en desarrollo sin nombre del grupo o de un ítem solo con ícono', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    @Component({
      imports: [MimiToggleGroupImports],
      template: `<mimi-toggle-group>
        <button mimiToggleGroupItem="a">A</button>
        <button mimiToggleGroupItem="b"><svg aria-hidden="true"></svg></button>
      </mimi-toggle-group>`,
    })
    class WarnHost {}
    const fixture = TestBed.createComponent(WarnHost);
    await settle(fixture);
    expect(warn).toHaveBeenCalledTimes(1);
    const text = String(warn.mock.calls[0][0]);
    expect(text).toContain('[Mimi] Toggle Group');
    expect(text).toContain('aria-label');
    expect(text).toContain('sin texto visible');
    warn.mockRestore();
  });

  it('avisa si value no coincide con el modo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    @Component({
      imports: [MimiToggleGroupImports],
      template: `<mimi-toggle-group aria-label="M" multiple [value]="'a'">
        <button mimiToggleGroupItem="a">A</button>
      </mimi-toggle-group>`,
    })
    class ModeHost {}
    const fixture = TestBed.createComponent(ModeHost);
    await settle(fixture);
    expect(String(warn.mock.calls[0]?.[0])).toContain('tiene que ser un arreglo');
    warn.mockRestore();
  });

  it('sin avisos cuando todo tiene nombre', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await setup();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('MimiToggleGroup con formularios', () => {
  async function setup() {
    const fixture = TestBed.createComponent(FormsHost);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const group = (name: string) => root.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const item = (name: string, value: string) =>
      group(name).querySelector<HTMLButtonElement>(`[mimiToggleGroupItem="${value}"]`)!;
    return { fixture, host: fixture.componentInstance, root, group, item };
  }

  it('Reactive Forms: simple y múltiple, en los dos sentidos', async () => {
    const { fixture, host, item } = await setup();
    item('reactive', 'm').click();
    item('reactive-multi', 'b').click();
    await settle(fixture);
    expect(host.group.value).toEqual({ size: 'm', tags: ['b'] });
    host.group.setValue({ size: 's', tags: ['a', 'b'] });
    await settle(fixture);
    expect(item('reactive', 's').getAttribute('aria-checked')).toBe('true');
    expect(item('reactive-multi', 'a').getAttribute('aria-pressed')).toBe('true');
  });

  it('Reactive Forms: disabled, touched al salir del grupo y error visible', async () => {
    const { fixture, host, group, item, root } = await setup();
    item('reactive', 's').focus();
    item('reactive', 's').blur();
    root.querySelector<HTMLElement>('[data-test="out"]')!.focus();
    await settle(fixture);
    expect(host.group.controls.size.touched).toBe(true);
    expect(group('reactive').getAttribute('aria-invalid')).toBe('true');
    expect(group('reactive').hasAttribute('data-invalid')).toBe(true);
    host.group.controls.size.disable();
    await settle(fixture);
    expect(item('reactive', 's').disabled).toBe(true);
  });

  it('Signal Forms: un campo T y otro T[] contra el mismo componente', async () => {
    const { fixture, host, item, group } = await setup();
    item('signal', 'm').click();
    item('signal-multi', 'a').click();
    item('signal-multi', 'b').click();
    await settle(fixture);
    expect(host.data()).toEqual({ size: 'm', tags: ['a', 'b'] });
    host.data.set({ size: 's', tags: ['b'] });
    await settle(fixture);
    expect(item('signal', 's').getAttribute('aria-checked')).toBe('true');
    expect(item('signal-multi', 'a').getAttribute('aria-pressed')).toBe('false');
    host.locked.set(true);
    await settle(fixture);
    expect(group('signal').getAttribute('aria-disabled')).toBe('true');
    expect(item('signal', 's').disabled).toBe(true);
  });

  it('Signal Forms: requerido, tocado al salir y error visible', async () => {
    const { fixture, host, group, item, root } = await setup();
    host.data.set({ size: null, tags: [] });
    item('signal', 's').focus();
    root.querySelector<HTMLElement>('[data-test="out"]')!.focus();
    await settle(fixture);
    expect(host.signalForm.size().touched()).toBe(true);
    expect(group('signal').getAttribute('aria-invalid')).toBe('true');
    expect(group('signal').getAttribute('aria-required')).toBe('true');
  });

  it('ngModel: simple y múltiple', async () => {
    const { fixture, host, item } = await setup();
    expect(item('ng-model', 'm').getAttribute('aria-checked')).toBe('true');
    expect(item('ng-model-multi', 'b').getAttribute('aria-pressed')).toBe('true');
    item('ng-model', 's').click();
    item('ng-model-multi', 'a').click();
    await settle(fixture);
    expect(host.model).toBe('s');
    expect(host.modelMulti).toEqual(['b', 'a']);
  });
});

describe('MimiToggleGroup en derecha a izquierda', () => {
  it('← avanza y → retrocede; ↑ y ↓ no cambian', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Directionality,
          useValue: { value: 'rtl', valueSignal: signal('rtl'), change: new EventEmitter() },
        },
      ],
    });
    @Component({
      imports: [MimiToggleGroupImports],
      template: `<mimi-toggle-group aria-label="T" [(value)]="value">
        <button mimiToggleGroupItem="a">A</button>
        <button mimiToggleGroupItem="b">B</button>
        <button mimiToggleGroupItem="c">C</button>
      </mimi-toggle-group>`,
    })
    class RtlHost {
      readonly value = signal<string | null>('a');
    }
    const fixture = TestBed.createComponent(RtlHost);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const item = (v: string) => root.querySelector<HTMLElement>(`[mimiToggleGroupItem="${v}"]`)!;
    item('a').focus();
    press(item('a'), 'ArrowLeft');
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe('b');
    press(item('b'), 'ArrowRight');
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe('a');
    press(item('a'), 'ArrowDown');
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe('b');
    // El indicador se desplaza hacia la izquierda.
    const indicator = root.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    expect(indicator.style.translate).toContain('calc(-1 * var(--mimi-toggle-group-index)');
    expect(MimiToggleGroup).toBeDefined();
    (document.activeElement as HTMLElement).blur();
  });
});
