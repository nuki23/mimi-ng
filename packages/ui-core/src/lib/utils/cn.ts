import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge solo reconoce tallas (sm, md, lg…) en las escalas de sombra y radio.
 * Sin registrar los tokens de Mimi, `shadow-card` se tomaría como color de sombra y
 * `rounded-card` no se fusionaría con otros `rounded-*`; lo mismo `animate-mimi-pulse` con
 * `animate-none` y `backdrop-blur-glass` con otros `backdrop-blur-*`. Los colores no hace falta registrarlos: la escala de color acepta cualquier
 * nombre.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: [
        'card',
        'primary',
        'primary-hover',
        'destructive',
        'destructive-hover',
        'neutral',
        'neutral-hover',
        'thumb',
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
      ],
      radius: ['card', 'badge'],
      blur: ['glass', 'overlay'],
      animate: ['mimi-pulse'],
    },
    classGroups: {
      transition: ['mimi-transition'],
    },
  },
});

/** Une clases con clsx y resuelve los conflictos de Tailwind (gana la última). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
