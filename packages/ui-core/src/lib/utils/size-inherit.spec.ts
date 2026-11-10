import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiAvatar } from '@/components/ui/avatar';
import { MimiBadge } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiChip } from '@/components/ui/chip';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiInput } from '@/components/ui/input';
import { MimiPopover, MimiPopoverContent, MimiPopoverTrigger } from '@/components/ui/popover';
import { MimiSelect } from '@/components/ui/select';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiTabs } from '@/components/ui/tabs';
import { MimiTextarea } from '@/components/ui/textarea';

/**
 * Un control sin `size` propio NO escribe `data-size`: el `md` vive en el tema (`:root`) y cada
 * control hereda, por la cascada de CSS, el del contenedor `[data-size]` más cercano (un
 * `mimiSize`, pero también un contenedor cualquiera que lo lleve). Con `size` propio, lo escribe.
 */
@Component({
  imports: [
    MimiSelect,
    MimiCheckbox,
    MimiSwitch,
    MimiTabs,
    MimiDatePicker,
    MimiTextarea,
    MimiBadge,
    MimiChip,
    MimiButton,
    MimiInput,
    MimiAvatar,
    MimiPopover,
    MimiPopoverTrigger,
    MimiPopoverContent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form data-test="form" data-size="sm">
      <mimi-select data-test="select" aria-label="a" />
      <mimi-checkbox data-test="checkbox">c</mimi-checkbox>
      <mimi-switch data-test="switch">s</mimi-switch>
      <mimi-tabs data-test="tabs" aria-label="t" />
      <mimi-date-picker data-test="date" aria-label="d" />
      <textarea mimiTextarea data-test="textarea"></textarea>
      <span mimiBadge data-test="badge">b</span>
      <mimi-chip data-test="chip">c</mimi-chip>
      <button mimiBtn data-test="button">b</button>
      <input mimiInput data-test="input" />
      <mimi-avatar data-test="avatar" />
      <mimi-select data-test="own" aria-label="o" size="lg" />
      <mimi-popover data-test="popover" [open]="true">
        <button mimiPopoverTrigger>abrir</button>
        <ng-template mimiPopoverContent>contenido</ng-template>
      </mimi-popover>
    </form>
  `,
})
class Host {}

describe('herencia del tamaño por la cascada (MimiSized)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('sin size propio no hay data-size en el control: lo hereda del contenedor', async () => {
    const el = await setup();
    for (const name of [
      'select',
      'checkbox',
      'switch',
      'tabs',
      'date',
      'textarea',
      'badge',
      'chip',
      'button',
      'input',
      'avatar',
    ]) {
      const node = el.querySelector(`[data-test="${name}"]`)!;
      expect(node.hasAttribute('data-size'), name).toBe(false);
      // Lo que ve la hoja de estilos: el [data-size] más cercano es el del formulario.
      expect(node.closest('[data-size]')?.getAttribute('data-size'), name).toBe('sm');
    }
  });

  it('con size propio lo escribe', async () => {
    const el = await setup();
    expect(el.querySelector('[data-test="own"]')!.getAttribute('data-size')).toBe('lg');
  });

  it('el panel de un Popover (en un overlay) lleva el tamaño del contenedor', async () => {
    await setup();
    await new Promise((r) => setTimeout(r, 30));
    const panel = document.querySelector('[role="dialog"][data-mimi-overlay-panel]');
    expect(panel?.getAttribute('data-size')).toBe('sm');
  });
});
