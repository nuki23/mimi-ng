import { cn } from './cn';

describe('cn', () => {
  it('shadow-none reemplaza a una sombra de Mimi', () => {
    expect(cn('shadow-primary', 'shadow-none')).toBe('shadow-none');
  });

  it('una sombra de Mimi reemplaza a otra', () => {
    expect(cn('shadow-card', 'shadow-primary')).toBe('shadow-primary');
  });

  it('rounded-none reemplaza a rounded-card', () => {
    expect(cn('rounded-card', 'rounded-none')).toBe('rounded-none');
  });

  it('un color de Mimi reemplaza a otro', () => {
    expect(cn('bg-primary', 'bg-destructive')).toBe('bg-destructive');
  });

  it('resuelve clases estándar de Tailwind', () => {
    expect(cn('h-10', 'h-12')).toBe('h-12');
  });

  it('acepta clases condicionales de clsx', () => {
    const disabled = true;
    const loading = false;
    expect(cn('bg-primary', { 'opacity-50': disabled, 'cursor-progress': loading })).toBe(
      'bg-primary opacity-50',
    );
    expect(cn('px-4', disabled && 'px-2', loading && 'px-8')).toBe('px-2');
  });

  it('rounded-badge reemplaza a rounded-lg', () => {
    expect(cn('rounded-lg', 'rounded-badge')).toBe('rounded-badge');
  });

  it('mimi-transition entra en el grupo de transiciones', () => {
    expect(cn('mimi-transition', 'transition-none')).toBe('transition-none');
  });

  it('mantiene la misma sombra con distinto modificador', () => {
    expect(cn('shadow-primary', 'hover:shadow-primary-hover')).toBe(
      'shadow-primary hover:shadow-primary-hover',
    );
  });

  it('no confunde colores propios con otros grupos', () => {
    expect(cn('ring-3', 'ring-ring-soft', 'bg-input-background', 'bg-card')).toBe(
      'ring-3 ring-ring-soft bg-card',
    );
  });
});
