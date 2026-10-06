/**
 * Variables CSS de cada componente (spec 13): única fuente de las tablas «Variables CSS» del
 * showcase. component-tokens.spec.ts compara esta lista con el código de ui-core, para que no se
 * desactualice.
 *
 * - `inherits`: el token del que toma su valor si no se define (cascada de la spec 6.2).
 * - `preset`: true si se puede definir con provideMimiTheme (components.<nombre>); los colores
 *   solo se cambian en el CSS, porque cambian entre claro y oscuro (spec 6.2).
 * - `deprecated`: nombre de la 0.1.0 que sigue funcionando hasta la 1.0 (spec 12).
 */
export interface CssVariable {
  name: string;
  default: string;
  inherits?: string;
  preset: boolean;
  description: string;
  deprecated?: string;
}

export type TokenComponent =
  | 'avatar'
  | 'badge'
  | 'button'
  | 'card'
  | 'checkbox'
  | 'formField'
  | 'input'
  | 'separator'
  | 'skeleton'
  | 'switch'
  | 'textarea';

/** Prefijo de cada componente, el mismo que COMPONENT_PREFIX de ui-core. */
export const TOKEN_PREFIX: Record<TokenComponent, string> = {
  avatar: 'avatar',
  badge: 'badge',
  button: 'btn',
  card: 'card',
  checkbox: 'checkbox',
  formField: 'field',
  input: 'input',
  separator: 'separator',
  skeleton: 'skeleton',
  switch: 'switch',
  textarea: 'textarea',
};

export const COMPONENT_TOKENS: Record<TokenComponent, CssVariable[]> = {
  avatar: [
    { name: '--mimi-avatar-size', default: '2.5rem', preset: true, description: 'Tamaño default.' },
    { name: '--mimi-avatar-size-sm', default: '2rem', preset: true, description: 'Tamaño sm.' },
    { name: '--mimi-avatar-size-lg', default: '3.5rem', preset: true, description: 'Tamaño lg.' },
    { name: '--mimi-avatar-radius', default: 'círculo', preset: true, description: 'Radio.' },
    {
      name: '--mimi-avatar-bg',
      default: 'secondary',
      inherits: '--mimi-secondary',
      preset: false,
      description: 'Fondo de las iniciales.',
    },
    {
      name: '--mimi-avatar-fg',
      default: 'secondary-foreground',
      inherits: '--mimi-secondary-foreground',
      preset: false,
      description: 'Color de las iniciales.',
    },
  ],
  badge: [
    { name: '--mimi-badge-height', default: '22px', preset: true, description: 'Alto.' },
    {
      name: '--mimi-badge-px',
      default: '0.625rem',
      preset: true,
      description: 'Padding horizontal.',
    },
    {
      name: '--mimi-badge-font-size',
      default: '0.75rem',
      preset: true,
      description: 'Tamaño de letra.',
    },
    {
      name: '--mimi-badge-font-weight',
      default: '600',
      preset: true,
      description: 'Peso de la letra.',
    },
    {
      name: '--mimi-badge-radius',
      default: '999px',
      preset: true,
      description: 'Radio (el mismo que radii.badge de la 0.1.0). Los colores salen del tono.',
    },
  ],
  button: [
    {
      name: '--mimi-btn-height',
      default: '2.5rem',
      inherits: '--mimi-control-height',
      preset: true,
      description: 'Alto de los tamaños default e icon.',
    },
    {
      name: '--mimi-btn-height-sm',
      default: '2rem',
      inherits: '--mimi-control-height-sm',
      preset: true,
      description: 'Alto del tamaño sm.',
    },
    {
      name: '--mimi-btn-height-lg',
      default: '3rem',
      inherits: '--mimi-control-height-lg',
      preset: true,
      description: 'Alto del tamaño lg.',
    },
    {
      name: '--mimi-btn-radius',
      default: '0.75rem',
      inherits: '--mimi-radius',
      preset: true,
      description: 'Radio.',
    },
    {
      name: '--mimi-btn-px',
      default: '1rem',
      preset: true,
      description: 'Padding horizontal del tamaño default.',
    },
    {
      name: '--mimi-btn-padding-x',
      default: '1rem',
      preset: true,
      description: 'Padding horizontal.',
      deprecated: '--mimi-btn-px',
    },
    {
      name: '--mimi-btn-gap',
      default: '0.5rem',
      preset: true,
      description: 'Espacio entre ícono y texto del tamaño default.',
    },
    {
      name: '--mimi-btn-font-size',
      default: '0.875rem',
      preset: true,
      description: 'Tamaño de letra del tamaño default.',
    },
    {
      name: '--mimi-btn-font-weight',
      default: '500',
      preset: true,
      description: 'Peso de la letra.',
    },
    {
      name: '--mimi-btn-letter-spacing',
      default: 'normal',
      preset: true,
      description: 'Espaciado entre letras.',
    },
    {
      name: '--mimi-btn-border-width',
      default: '1px',
      preset: true,
      description: 'Grosor del borde. Los colores salen del tono.',
    },
    {
      name: '--mimi-btn-focus-ring-width',
      default: '2px',
      preset: true,
      description: 'Grosor del contorno de foco.',
    },
    {
      name: '--mimi-btn-press-scale',
      default: '0.975',
      inherits: '--mimi-press-scale',
      preset: true,
      description: 'Escala al presionar (1 con movimiento reducido).',
    },
  ],
  card: [
    {
      name: '--mimi-card-radius',
      default: 'radius-card',
      inherits: '--mimi-radius-card',
      preset: true,
      description: 'Radio.',
    },
    {
      name: '--mimi-card-border-width',
      default: '1px',
      preset: true,
      description: 'Grosor del borde.',
    },
    {
      name: '--mimi-card-shadow',
      default: 'shadow-card',
      inherits: '--mimi-shadow-card',
      preset: true,
      description: 'Sombra.',
    },
    {
      name: '--mimi-card-padding',
      default: '1.5rem',
      preset: true,
      description: 'Padding exterior de las partes.',
    },
    {
      name: '--mimi-card-padding-header',
      default: '1.5rem 1.5rem 1rem',
      inherits: '--mimi-card-padding',
      preset: true,
      description: 'Padding del encabezado.',
    },
    {
      name: '--mimi-card-padding-content',
      default: '0 1.5rem 1.25rem',
      inherits: '--mimi-card-padding',
      preset: true,
      description: 'Padding del contenido.',
    },
    {
      name: '--mimi-card-padding-footer',
      default: '0 1.5rem 1.5rem',
      inherits: '--mimi-card-padding',
      preset: true,
      description: 'Padding del pie.',
    },
    {
      name: '--mimi-card-bg',
      default: 'card',
      inherits: '--mimi-card',
      preset: false,
      description: 'Fondo.',
    },
    {
      name: '--mimi-card-fg',
      default: 'card-foreground',
      inherits: '--mimi-card-foreground',
      preset: false,
      description: 'Texto.',
    },
    {
      name: '--mimi-card-border',
      default: 'border',
      inherits: '--mimi-border',
      preset: false,
      description: 'Color del borde.',
    },
  ],
  checkbox: [
    {
      name: '--mimi-checkbox-size',
      default: '1rem',
      preset: true,
      description: 'Tamaño de la casilla.',
    },
    {
      name: '--mimi-checkbox-radius',
      default: 'radius-sm',
      inherits: '--mimi-radius-sm',
      preset: true,
      description: 'Radio.',
    },
    {
      name: '--mimi-checkbox-border',
      default: 'input',
      inherits: '--mimi-input',
      preset: false,
      description: 'Color del borde.',
    },
    {
      name: '--mimi-checkbox-checked-bg',
      default: 'primary',
      inherits: '--mimi-primary',
      preset: false,
      description: 'Fondo marcada o indeterminada.',
    },
    {
      name: '--mimi-checkbox-check',
      default: 'primary-foreground',
      inherits: '--mimi-primary-foreground',
      preset: false,
      description: 'Color de la marca.',
    },
  ],
  formField: [
    {
      name: '--mimi-field-gap',
      default: '0.375rem',
      preset: true,
      description: 'Espacio entre etiqueta, control y mensaje.',
    },
    {
      name: '--mimi-field-label-size',
      default: '0.875rem',
      preset: true,
      description: 'Tamaño de la etiqueta.',
    },
    {
      name: '--mimi-field-label-weight',
      default: '500',
      preset: true,
      description: 'Peso de la etiqueta.',
    },
    {
      name: '--mimi-field-error',
      default: 'destructive',
      inherits: '--mimi-destructive',
      preset: false,
      description: 'Color de la etiqueta y del mensaje con error.',
    },
  ],
  input: [
    {
      name: '--mimi-input-height',
      default: '2.5rem',
      inherits: '--mimi-control-height',
      preset: true,
      description: 'Alto del tamaño default.',
    },
    {
      name: '--mimi-input-height-sm',
      default: '2rem',
      inherits: '--mimi-control-height-sm',
      preset: true,
      description: 'Alto del tamaño sm.',
    },
    {
      name: '--mimi-input-height-lg',
      default: '3rem',
      inherits: '--mimi-control-height-lg',
      preset: true,
      description: 'Alto del tamaño lg.',
    },
    {
      name: '--mimi-input-radius',
      default: '0.75rem',
      inherits: '--mimi-radius',
      preset: true,
      description: 'Radio.',
    },
    {
      name: '--mimi-input-px',
      default: '0.75rem',
      preset: true,
      description: 'Padding horizontal.',
    },
    {
      name: '--mimi-input-padding-x',
      default: '0.75rem',
      preset: true,
      description: 'Padding horizontal.',
      deprecated: '--mimi-input-px',
    },
    {
      name: '--mimi-input-font-size',
      default: '0.875rem',
      preset: true,
      description: 'Tamaño de letra del tamaño default.',
    },
    {
      name: '--mimi-input-border-width',
      default: '1px',
      preset: true,
      description: 'Grosor del borde.',
    },
    {
      name: '--mimi-input-focus-ring-width',
      default: '3px',
      preset: true,
      description: 'Grosor del halo de foco.',
    },
    {
      name: '--mimi-input-disabled-opacity',
      default: '0.5',
      inherits: '--mimi-disabled-opacity',
      preset: true,
      description: 'Opacidad deshabilitado.',
    },
    {
      name: '--mimi-input-bg',
      default: 'input-background',
      inherits: '--mimi-input-background',
      preset: false,
      description: 'Fondo.',
    },
    {
      name: '--mimi-input-fg',
      default: 'foreground',
      inherits: '--mimi-foreground',
      preset: false,
      description: 'Texto.',
    },
    {
      name: '--mimi-input-border',
      default: 'input',
      inherits: '--mimi-input',
      preset: false,
      description: 'Color del borde.',
    },
    {
      name: '--mimi-input-border-focus',
      default: 'ring',
      inherits: '--mimi-ring',
      preset: false,
      description: 'Color del borde con foco.',
    },
    {
      name: '--mimi-input-error',
      default: 'destructive',
      inherits: '--mimi-destructive',
      preset: false,
      description: 'Color del borde con error.',
    },
    {
      name: '--mimi-input-placeholder',
      default: 'muted-foreground',
      inherits: '--mimi-muted-foreground',
      preset: false,
      description: 'Color del placeholder.',
    },
    {
      name: '--mimi-input-placeholder-color',
      default: 'muted-foreground',
      preset: false,
      description: 'Color del placeholder.',
      deprecated: '--mimi-input-placeholder',
    },
  ],
  separator: [
    {
      name: '--mimi-separator-size',
      default: '1px',
      preset: true,
      description: 'Grosor de la línea.',
    },
    {
      name: '--mimi-separator-color',
      default: 'border',
      inherits: '--mimi-border',
      preset: false,
      description: 'Color de la línea.',
    },
  ],
  skeleton: [
    {
      name: '--mimi-skeleton-radius',
      default: 'radius-sm',
      inherits: '--mimi-radius-sm',
      preset: true,
      description: 'Radio.',
    },
    {
      name: '--mimi-skeleton-duration',
      default: '1.6s',
      preset: true,
      description: 'Duración del pulso.',
    },
    {
      name: '--mimi-skeleton-bg',
      default: 'muted',
      inherits: '--mimi-muted',
      preset: false,
      description: 'Fondo.',
    },
  ],
  switch: [
    {
      name: '--mimi-switch-width',
      default: '2.25rem',
      preset: true,
      description: 'Ancho de la pista. El pulgar se desplaza ancho − alto.',
    },
    {
      name: '--mimi-switch-height',
      default: '1.25rem',
      preset: true,
      description: 'Alto de la pista. El pulgar mide alto − 4px.',
    },
    {
      name: '--mimi-switch-track-on',
      default: 'primary',
      inherits: '--mimi-primary',
      preset: false,
      description: 'Pista encendida.',
    },
    {
      name: '--mimi-switch-track-off',
      default: 'switch-off',
      inherits: '--mimi-switch-off',
      preset: false,
      description: 'Pista apagada.',
    },
    {
      name: '--mimi-switch-thumb',
      default: 'background',
      inherits: '--mimi-background',
      preset: false,
      description: 'Pulgar apagado.',
    },
  ],
  textarea: [
    {
      name: '--mimi-textarea-radius',
      default: '0.75rem',
      inherits: '--mimi-input-radius',
      preset: true,
      description: 'Radio.',
    },
    {
      name: '--mimi-textarea-min-height',
      default: '2.5rem',
      inherits: '--mimi-input-height',
      preset: true,
      description: 'Alto mínimo (una fila).',
    },
    {
      name: '--mimi-textarea-line-height',
      default: '1.25rem',
      preset: true,
      description: 'Interlineado.',
    },
    {
      name: '--mimi-textarea-py',
      default: '(alto mínimo − interlineado − 2 bordes) / 2',
      preset: true,
      description: 'Padding vertical.',
    },
    {
      name: '--mimi-textarea-bg',
      default: 'input-background',
      inherits: '--mimi-input-bg',
      preset: false,
      description: 'Fondo.',
    },
    {
      name: '--mimi-textarea-border',
      default: 'input',
      inherits: '--mimi-input-border',
      preset: false,
      description: 'Color del borde.',
    },
  ],
};
