import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiInput } from '@/components/ui/input';
import {
  MimiPassword,
  mimiPasswordLevel,
  type MimiPasswordLevel,
  type MimiPasswordRule,
} from './password';
import { MIMI_PASSWORD_TEXT_ES, provideMimiPasswordText } from './password-texts';

@Component({
  imports: [MimiPassword, MimiInput, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <mimi-password
      data-test="new"
      [meter]="meter()"
      [rules]="rules()"
      [strength]="strength()"
      [class]="extra()"
    >
      <input
        mimiInput
        type="password"
        autocomplete="new-password"
        aria-label="Contraseña nueva"
        aria-describedby="hint"
        [formControl]="control"
      />
    </mimi-password>
    <span id="hint">Pista</span>
    <mimi-password data-test="signal">
      <input mimiInput type="password" aria-label="Señal" [formField]="signalForm.pw" />
    </mimi-password>
    <mimi-password data-test="ng-model">
      <input mimiInput type="password" aria-label="Modelo" name="pw" [(ngModel)]="model" />
    </mimi-password>
    <mimi-password data-test="off">
      <input mimiInput type="password" aria-label="Apagado" disabled />
    </mimi-password>
    <button data-test="out">Fuera</button>
  `,
})
class Host {
  readonly meter = signal(true);
  readonly rules = signal<readonly MimiPasswordRule[] | undefined>(undefined);
  readonly strength = signal<((v: string) => MimiPasswordLevel) | undefined>(undefined);
  readonly extra = signal('');
  readonly control = new FormControl('', Validators.required);
  readonly data = signal({ pw: '' });
  readonly signalForm = form(this.data, (p) => required(p.pw));
  model = '';
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('mimiPasswordLevel (la heurística del diseño)', () => {
  const rules: MimiPasswordRule[] = [
    { label: '8', test: (v) => v.length >= 8 },
    { label: 'A', test: (v) => /[A-Z]/.test(v) },
    { label: '1', test: (v) => /\d/.test(v) },
    { label: '#', test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];
  it('vacío 0; 0–1 reglas débil; 2–3 media; las 4 fuerte', () => {
    expect(mimiPasswordLevel('', rules)).toBe(0);
    expect(mimiPasswordLevel('abc', rules)).toBe(1);
    expect(mimiPasswordLevel('abcdefgh', rules)).toBe(1);
    expect(mimiPasswordLevel('Abcdefgh', rules)).toBe(2);
    expect(mimiPasswordLevel('Abcdefg1', rules)).toBe(2);
    expect(mimiPasswordLevel('Abcdef1!', rules)).toBe(3);
  });
});

describe('MimiPassword', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const part = (name: string) => root.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const input = (name: string) => part(name).querySelector<HTMLInputElement>('input')!;
    const toggle = (name: string) =>
      part(name).querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
    const type = async (name: string, text: string) => {
      input(name).value = text;
      input(name).dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, root, part, input, toggle, type };
  }

  it('mostrar y ocultar: cambia el type del mismo input, aria-pressed y el nombre del botón', async () => {
    const { fixture, input, toggle } = await setup();
    const el = input('new');
    expect(toggle('new').getAttribute('aria-pressed')).toBe('false');
    expect(toggle('new').getAttribute('aria-label')).toBe('Show password');
    toggle('new').focus();
    toggle('new').click();
    await settle(fixture);
    expect(input('new')).toBe(el);
    expect(el.type).toBe('text');
    expect(toggle('new').getAttribute('aria-pressed')).toBe('true');
    expect(toggle('new').getAttribute('aria-label')).toBe('Hide password');
    // El foco no se mueve.
    expect(document.activeElement).toBe(toggle('new'));
    toggle('new').click();
    await settle(fixture);
    expect(el.type).toBe('password');
  });

  it('el botón es una parada de Tab nativa y no pisa el autocomplete del usuario', async () => {
    const { input, toggle } = await setup();
    expect(toggle('new').tagName).toBe('BUTTON');
    expect(toggle('new').getAttribute('type')).toBe('button');
    expect(toggle('new').hasAttribute('tabindex')).toBe(false);
    expect(input('new').getAttribute('autocomplete')).toBe('new-password');
  });

  it('medidor: nivel visible, barras y reglas; describe al input sin borrar su aria-describedby', async () => {
    const { part, input, type } = await setup();
    const meter = part('new').querySelector<HTMLElement>('[data-slot="meter"]')!;
    expect(input('new').getAttribute('aria-describedby')).toBe(`hint ${meter.id}`);
    await type('new', 'abc');
    expect(part('new').getAttribute('data-level')).toBe('1');
    expect(meter.querySelector('[data-slot="level"]')!.textContent!.trim()).toBe('Weak');
    await type('new', 'Abcdefg1');
    expect(part('new').getAttribute('data-level')).toBe('2');
    expect(meter.querySelector('[data-slot="level"]')!.textContent!.trim()).toBe('Medium');
    await type('new', 'Abcdef1!');
    expect(part('new').getAttribute('data-level')).toBe('3');
    const bars = meter.querySelectorAll('[aria-hidden="true"] > span');
    expect(bars.length).toBe(4);
    expect(bars[3].className).toContain('--mimi-strength-strong');
    expect(meter.querySelectorAll('li[data-state="met"]').length).toBe(4);
  });

  it('sin medidor: no hay bloque y el aria-describedby queda como estaba', async () => {
    const { fixture, host, part, input } = await setup();
    host.meter.set(false);
    await settle(fixture);
    expect(part('new').querySelector('[data-slot="meter"]')).toBeNull();
    expect(input('new').getAttribute('aria-describedby')).toBe('hint');
  });

  it('anuncia solo cuando cambia el nivel, en polite', async () => {
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue();
    const { type } = await setup();
    await type('new', 'a');
    await type('new', 'ab');
    await type('new', 'abc');
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenLastCalledWith('Password strength: Weak', 'polite');
    await type('new', 'Abcdefg1');
    await type('new', 'Abcdefg12');
    expect(announce).toHaveBeenCalledTimes(2);
    await type('new', 'Abcdefg1!');
    expect(announce).toHaveBeenCalledTimes(3);
    expect(announce).toHaveBeenLastCalledWith('Password strength: Strong', 'polite');
  });

  it('reglas propias y una función de nivel del usuario', async () => {
    const { fixture, host, part, type } = await setup();
    host.rules.set([{ label: '12 o más', test: (v) => v.length >= 12 }]);
    await settle(fixture);
    expect(part('new').querySelectorAll('li').length).toBe(1);
    await type('new', 'corta');
    expect(part('new').getAttribute('data-level')).toBe('1');
    host.strength.set(() => 3);
    await type('new', 'otra');
    expect(part('new').getAttribute('data-level')).toBe('3');
    host.rules.set([]);
    await settle(fixture);
    expect(part('new').querySelector('ul')).toBeNull();
  });

  it('Reactive Forms: el valor llega al mostrar y al ocultar; error en la caja', async () => {
    const { fixture, host, input, toggle, type, part, root } = await setup();
    await type('new', 'secreto1');
    expect(host.control.value).toBe('secreto1');
    toggle('new').click();
    await type('new', 'secreto12');
    expect(host.control.value).toBe('secreto12');
    host.control.setValue('');
    input('new').focus();
    root.querySelector<HTMLElement>('[data-test="out"]')!.focus();
    await settle(fixture);
    expect(part('new').querySelector('[data-slot="box"]')!.hasAttribute('data-invalid')).toBe(true);
    host.control.disable();
    await settle(fixture);
    expect(toggle('new').disabled).toBe(true);
    expect(part('new').querySelector('[data-slot="box"]')!.hasAttribute('data-disabled')).toBe(
      true,
    );
  });

  it('Signal Forms y ngModel', async () => {
    const { fixture, host, type, toggle } = await setup();
    await type('signal', 'Abc123!x');
    expect(host.data().pw).toBe('Abc123!x');
    toggle('signal').click();
    await type('signal', 'Abc123!xy');
    expect(host.data().pw).toBe('Abc123!xy');
    await type('ng-model', 'modelo');
    expect(host.model).toBe('modelo');
    void fixture;
  });

  it('deshabilitado sin formulario: el botón también', async () => {
    const { toggle, part } = await setup();
    expect(toggle('off').disabled).toBe(true);
    expect(part('off').querySelector('[data-slot="box"]')!.hasAttribute('data-disabled')).toBe(
      true,
    );
  });

  it('class del usuario va a la caja; la caja oculta el ojo de Edge y el anillo del input', async () => {
    const { fixture, host, part } = await setup();
    host.extra.set('h-12 rounded-full');
    await settle(fixture);
    const box = part('new').querySelector<HTMLElement>('[data-slot="box"]')!;
    expect(box.className).toContain('h-12');
    expect(box.className).not.toContain('h-[var(--mimi-input-height');
    expect(box.className).toContain('[&_input::-ms-reveal]:hidden');
    expect(box.className).toContain('focus-within:ring-3');
  });

  it('textos en español', async () => {
    TestBed.configureTestingModule({ providers: [provideMimiPasswordText(MIMI_PASSWORD_TEXT_ES)] });
    const { toggle, part, type } = await setup();
    expect(toggle('new').getAttribute('aria-label')).toBe('Mostrar contraseña');
    expect(part('new').querySelector('li')!.textContent).toContain('8 caracteres o más');
    await type('new', 'abc');
    expect(part('new').querySelector('[data-slot="level"]')!.textContent!.trim()).toBe('Débil');
  });
});
