import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { cn } from './utils/cn';
import { controlSizes, type ControlSize } from './utils/control-styles';

/** Componente solo para la prueba: comprueba que ui-core compila y corre con TestBed. */
@Component({
  selector: 'mimi-probe',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.data-size]': 'size()',
  },
})
class ProbeComponent {
  readonly size = input<ControlSize>('default');
  readonly userClass = input('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('rounded-lg shadow-primary', controlSizes[this.size()], this.userClass()),
  );
}

describe('ui-core con TestBed', () => {
  it('crea un componente y aplica las clases con cn()', async () => {
    const fixture = TestBed.createComponent(ProbeComponent);
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('class', 'shadow-none');
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-size')).toBe('lg');
    expect(host.classList).toContain('h-[var(--mimi-control-height-lg,3rem)]');
    expect(host.classList).toContain('shadow-none');
    expect(host.classList).not.toContain('shadow-primary');
  });
});
