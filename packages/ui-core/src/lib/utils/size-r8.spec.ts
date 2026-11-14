import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCalendar } from '@/components/ui/calendar';
import { MimiChip } from '@/components/ui/chip';
import { MimiCommand } from '@/components/ui/command';
import { MimiDataTable } from '@/components/ui/data-table';
import { MimiPopover } from '@/components/ui/popover';
import { MimiSlider } from '@/components/ui/slider';
import { MimiSortableList } from '@/components/ui/sortable-list';
import { MimiToolbar } from '@/components/ui/toolbar';
import { MimiTree } from '@/components/ui/tree';

const r8Node = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const r8Fs = r8Node.getBuiltinModule('node:fs') as {
  readFileSync(p: string, e: 'utf8'): string;
};
const CSS = r8Fs.readFileSync(
  `${r8Node.cwd()}/packages/ui-core/src/lib/theme/theme-base.css`,
  'utf8',
);

/** Variables que R.8 agrega a la escala: las lee cada componente con respaldo al token de antes. */
const R8_VARS = [
  'chip-h',
  'chip-text',
  'slider-h',
  'slider-thumb-s',
  'toolbar-item-s',
  'toolbar-icon',
  'cal-cell',
  'cal-nav',
  'menu-item-h',
  'menu-text',
  'command-input-h',
  'command-item-h',
  'command-text',
  'tree-row-h',
  'tree-text',
  'sortable-item-h',
  'sortable-gap-s',
  'table-row-h',
  'table-head-h',
  'tooltip-text',
  'tooltip-px',
  'popover-w',
];

function block(selector: string): string {
  const start = CSS.indexOf(`\n${selector} {`);
  expect(start, selector).toBeGreaterThan(-1);
  return CSS.slice(start, CSS.indexOf('\n}', start));
}

describe('R.8: la escala del tema trae las variables de los componentes que faltaban', () => {
  it('cada variable está en sm, md y lg', () => {
    for (const selector of ["[data-size='sm']", ":root,\n[data-size='md']", "[data-size='lg']"]) {
      const body = block(selector);
      for (const name of R8_VARS) {
        expect(body, `${selector} ${name}`).toMatch(new RegExp(`--mimi-${name}:`));
      }
    }
  });
});

@Component({
  imports: [
    MimiChip,
    MimiSlider,
    MimiToolbar,
    MimiCalendar,
    MimiCommand,
    MimiTree,
    MimiSortableList,
    MimiDataTable,
    MimiPopover,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-chip data-test="chip" size="sm">a</mimi-chip>
    <mimi-slider data-test="slider" aria-label="s" size="lg" />
    <mimi-toolbar data-test="toolbar" aria-label="t" size="sm" />
    <mimi-calendar data-test="calendar" size="lg" />
    <mimi-command data-test="command" aria-label="c" size="sm" />
    <mimi-tree data-test="tree" aria-label="t" size="lg" />
    <mimi-sortable-list data-test="sortable" aria-label="s" size="sm" />
    <mimi-data-table data-test="table" aria-label="t" size="lg" />
    <mimi-popover data-test="popover" size="lg" />
  `,
})
class Host {}

describe('R.8: size en los componentes (data-size en el anfitrión)', () => {
  it('cada componente acepta size y lo pone en data-size', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const sizes: Record<string, string> = {
      chip: 'sm',
      slider: 'lg',
      toolbar: 'sm',
      calendar: 'lg',
      command: 'sm',
      tree: 'lg',
      sortable: 'sm',
      table: 'lg',
      popover: 'lg',
    };
    for (const [name, size] of Object.entries(sizes)) {
      expect(el.querySelector(`[data-test="${name}"]`)!.getAttribute('data-size'), name).toBe(size);
    }
  });

  it('un chip sin size no pone data-size: toma el del contenedor', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const chip = TestBed.createComponent(MimiChip);
    await chip.whenStable();
    expect((chip.nativeElement as HTMLElement).hasAttribute('data-size')).toBe(false);
  });
});
