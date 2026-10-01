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

  it('shadow-none reemplaza a shadow-thumb', () => {
    expect(cn('shadow-thumb', 'shadow-none')).toBe('shadow-none');
  });

  it('animate-none reemplaza a animate-mimi-pulse', () => {
    expect(cn('animate-mimi-pulse', 'animate-none')).toBe('animate-none');
  });

  it('mimi-transition entra en el grupo de transiciones', () => {
    expect(cn('mimi-transition', 'transition-none')).toBe('transition-none');
  });

  it('mantiene la misma sombra con distinto modificador', () => {
    expect(cn('shadow-primary', 'hover:shadow-primary-hover')).toBe(
      'shadow-primary hover:shadow-primary-hover',
    );
  });

  it('las sombras de tono, popover y glow se reemplazan con la clase del usuario', () => {
    for (const token of [
      'success',
      'success-hover',
      'warning',
      'warning-hover',
      'info',
      'info-hover',
      'popover',
      'glow',
      'glow-primary',
      'glow-success',
      'glow-warning',
      'glow-info',
      'glow-destructive',
    ]) {
      expect(cn(`shadow-${token}`, 'shadow-none'), token).toBe('shadow-none');
      expect(cn('shadow-card', `shadow-${token}`), token).toBe(`shadow-${token}`);
    }
  });

  it('backdrop-blur-glass y backdrop-blur-overlay entran en la escala de desenfoque', () => {
    expect(cn('backdrop-blur-glass', 'backdrop-blur-none')).toBe('backdrop-blur-none');
    expect(cn('backdrop-blur-overlay', 'backdrop-blur-glass')).toBe('backdrop-blur-glass');
  });

  it('ring-destructive-soft (alias de la 0.1.0) y ring-destructive-ring son el mismo grupo', () => {
    // El código copiado de la 0.1.0 usa ring-destructive-soft; sigue siendo un color de anillo.
    expect(cn('ring-destructive-soft', 'ring-destructive-ring')).toBe('ring-destructive-ring');
    expect(cn('ring-3', 'ring-destructive-soft')).toBe('ring-3 ring-destructive-soft');
    expect(cn('ring-success-ring', 'ring-ring-soft')).toBe('ring-ring-soft');
  });

  it('los colores de tono no se confunden con otros grupos', () => {
    expect(cn('bg-success', 'text-success-foreground', 'bg-success-soft')).toBe(
      'text-success-foreground bg-success-soft',
    );
    expect(cn('bg-destructive-soft-bg', 'text-destructive-soft-foreground', 'bg-glass')).toBe(
      'text-destructive-soft-foreground bg-glass',
    );
  });

  it('no confunde colores propios con otros grupos', () => {
    expect(cn('ring-3', 'ring-ring-soft', 'bg-input-background', 'bg-card')).toBe(
      'ring-3 ring-ring-soft bg-card',
    );
  });
});
