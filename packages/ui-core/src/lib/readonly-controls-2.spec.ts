import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiColorInput, MimiColorPicker } from '@/components/ui/color-picker';
import { MimiFileUpload } from '@/components/ui/file-upload';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';
import { MimiSlider } from '@/components/ui/slider';
import { MimiToggleGroup, MimiToggleGroupItem } from '@/components/ui/toggle-group';

/**
 * R.12 (resto): `readonly` en Slider, Color Picker, File Upload, Toggle Group y Password. Como el
 * `readonly` de un `<input>`: el valor se ve, se puede enfocar, **no se puede cambiar**.
 */
@Component({
  imports: [
    MimiSlider,
    MimiColorPicker,
    MimiColorInput,
    MimiFileUpload,
    MimiToggleGroup,
    MimiToggleGroupItem,
    MimiPassword,
    MimiInput,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-slider data-test="slider" aria-label="s" [(value)]="slider" [readonly]="ro()" />
    <mimi-color-picker data-test="picker" [(value)]="color" [readonly]="ro()" />
    <mimi-color-input data-test="colorinput" aria-label="c" [(value)]="color2" [readonly]="ro()" />
    <mimi-file-upload data-test="upload" aria-label="f" [(value)]="files" [readonly]="ro()" />
    <mimi-toggle-group data-test="group" aria-label="g" [(value)]="group" [readonly]="ro()">
      <button mimiToggleGroupItem="a">A</button>
      <button mimiToggleGroupItem="b">B</button>
    </mimi-toggle-group>
    <mimi-password data-test="password" [readonly]="ro()">
      <input mimiInput type="password" aria-label="p" value="secreto" />
    </mimi-password>
  `,
})
class Host {
  readonly ro = signal(true);
  readonly slider = signal<number | [number, number]>(30);
  readonly color = signal('#336699');
  readonly color2 = signal('#336699');
  readonly files = signal<File[]>([]);
  readonly group = signal<string | string[] | null>('a');
}

describe('readonly en los controles que faltaban (R.12)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = (t: string) => el.querySelector<HTMLElement>(`[data-test="${t}"]`)!;
    return { fixture, host: fixture.componentInstance, q };
  }

  it('Slider: las flechas no cambian el valor y el pulgar lleva aria-readonly', async () => {
    const { fixture, host, q } = await setup();
    const thumb = q('slider').querySelector<HTMLElement>('[role="slider"]')!;
    expect(thumb.getAttribute('aria-readonly')).toBe('true');
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.slider()).toBe(30);
    host.ro.set(false);
    await fixture.whenStable();
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.slider()).toBe(31);
    expect(thumb.hasAttribute('aria-readonly')).toBe(false);
  });

  it('Color Picker: el área no cambia el color y el campo hex es de solo lectura', async () => {
    const { fixture, host, q } = await setup();
    const area = q('picker').querySelector<HTMLElement>('[data-slot="area"]')!;
    expect(area.getAttribute('aria-readonly')).toBe('true');
    area.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(host.color()).toBe('#336699');
    expect(q('picker').querySelector<HTMLInputElement>('input')!.readOnly).toBe(true);
  });

  it('Color Input: el panel no se abre', async () => {
    const { q } = await setup();
    const button = q('colorinput').querySelector<HTMLButtonElement>('button')!;
    expect(button.getAttribute('aria-readonly')).toBe('true');
    button.click();
    await new Promise((r) => setTimeout(r, 30));
    expect(button.getAttribute('aria-expanded')).not.toBe('true');
  });

  it('File Upload: no abre el selector ni acepta archivos soltados', async () => {
    const { fixture, host, q } = await setup();
    const zone = q('upload').querySelector<HTMLButtonElement>('button')!;
    expect(zone.getAttribute('aria-disabled')).toBe('true');
    expect(zone.hasAttribute('disabled')).toBe(false);
    const drop = new Event('drop', { bubbles: true, cancelable: true }) as Event & {
      dataTransfer: unknown;
    };
    drop.dataTransfer = { files: [new File(['x'], 'a.txt')] };
    zone.dispatchEvent(drop);
    await fixture.whenStable();
    expect(host.files().length).toBe(0);
  });

  it('Toggle Group: el clic no cambia el valor y el grupo lleva aria-readonly', async () => {
    const { fixture, host, q } = await setup();
    expect(q('group').getAttribute('aria-readonly')).toBe('true');
    q('group').querySelectorAll<HTMLButtonElement>('button')[1].click();
    await fixture.whenStable();
    expect(host.group()).toBe('a');
    host.ro.set(false);
    await fixture.whenStable();
    q('group').querySelectorAll<HTMLButtonElement>('button')[1].click();
    await fixture.whenStable();
    expect(host.group()).toBe('b');
  });

  it('Password: el input queda de solo lectura y el ojo sigue funcionando', async () => {
    const { fixture, q } = await setup();
    const input = q('password').querySelector<HTMLInputElement>('input')!;
    expect(input.readOnly).toBe(true);
    const toggle = q('password').querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
    toggle.click();
    await fixture.whenStable();
    expect(input.type).toBe('text');
  });
});
