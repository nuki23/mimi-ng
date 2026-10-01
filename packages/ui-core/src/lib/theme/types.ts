/**
 * Preset tipado del tema (spec 6.3). Cada propiedad se convierte en una variable --mimi-*
 * de theme-base.css. Los derivados con color-mix (primary-hover, ring-soft, switch-off y los
 * <tono>-soft, <tono>-hover y <tono>-ring) no están aquí: se recalculan solos a partir de los
 * colores.
 */

/** Colores. `colors` se aplica en claro y `darkColors` en oscuro. */
export interface MimiColorTokens {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  inputBackground?: string;
  ring?: string;
  /** Fondo que oscurece la página detrás de paneles y diálogos. */
  overlay?: string;
  success?: string;
  successForeground?: string;
  /** Texto sobre el fondo suave de success. */
  successSoftForeground?: string;
  warning?: string;
  warningForeground?: string;
  warningSoftForeground?: string;
  info?: string;
  infoForeground?: string;
  infoSoftForeground?: string;
  destructiveSoftForeground?: string;
  /** Cuánto tono lleva cada fondo suave (-soft), en porcentaje: '12%'. */
  softMix?: string;
  tooltip?: string;
  tooltipForeground?: string;
  /** Fondo translúcido de las píldoras flotantes (mimi-toolbar, Pagination). */
  glass?: string;
  glassBorder?: string;
}

/** Sombras (`box-shadow` completo). `shadows` en claro y `darkShadows` en oscuro. */
export interface MimiShadowTokens {
  card?: string;
  primary?: string;
  primaryHover?: string;
  destructive?: string;
  destructiveHover?: string;
  neutral?: string;
  neutralHover?: string;
  /** Pulgar del Switch. */
  thumb?: string;
  success?: string;
  successHover?: string;
  warning?: string;
  warningHover?: string;
  info?: string;
  infoHover?: string;
  /** Menús, diálogos, toasts y píldoras flotantes. */
  popover?: string;
  /** Glow (opción glow): van a --mimi-glow y --mimi-glow-<tono>, sin el prefijo shadow-. */
  glow?: string;
  glowPrimary?: string;
  glowSuccess?: string;
  glowWarning?: string;
  glowInfo?: string;
  glowDestructive?: string;
}

/** Radios fijos. Si no se definen, sm y card se calculan a partir de `radius`. */
export interface MimiRadiusTokens {
  sm?: string;
  card?: string;
  badge?: string;
}

export interface MimiFontTokens {
  sans?: string;
  mono?: string;
}

export interface MimiMotionTokens {
  /** Lista de transiciones. Debe animar `scale` y `translate` (pulgar del Switch y `lift`). */
  transition?: string;
  pressScale?: string | number;
  /** Escala al presionar de Switch y Checkbox. */
  pressScaleSm?: string | number;
  lift?: string;
}

/** Alturas compartidas por Button, Input y Textarea (cascada de la spec 6.2). */
export interface MimiControlSizeTokens {
  height?: string;
  heightSm?: string;
  heightLg?: string;
}

/**
 * Tokens compartidos por todos los controles (spec 13, nivel 2). Las alturas van a
 * --mimi-control-height*; el resto, sin prefijo: focusRing → --mimi-focus-ring.
 */
export interface MimiSharedTokens extends MimiControlSizeTokens {
  /** Halo de foco en campos y botones (box-shadow). */
  focusRing?: string;
  /** Contorno de foco con teclado (outline). */
  focusOutline?: string;
  focusOffset?: string;
  disabledOpacity?: string | number;
  iconSize?: string;
  iconSizeSm?: string;
}

/**
 * Efectos que no son movimiento ni controles: desenfoques (y, más adelante, los de Mimi
 * Effects). Iguales en claro y oscuro.
 */
export interface MimiEffectTokens {
  /** Desenfoque del fondo detrás de Dialog y Sheet. */
  overlayBlur?: string;
  /** Desenfoque de las píldoras translúcidas. */
  glassBlur?: string;
}

/** Tokens por componente. Cada componente los lee con la cascada de la spec 6.2. */
export interface MimiControlTokens extends MimiControlSizeTokens {
  radius?: string;
  paddingX?: string;
  fontSize?: string;
  borderWidth?: string;
  focusRingWidth?: string;
}

/** paddingX y fontSize se aplican al tamaño default; sm y lg usan los valores del diseño. */
export interface MimiButtonTokens extends MimiControlTokens {
  fontWeight?: string | number;
  letterSpacing?: string;
}

export interface MimiInputTokens extends MimiControlTokens {
  placeholderColor?: string;
  disabledOpacity?: string | number;
}

export interface MimiCardTokens {
  radius?: string;
  borderWidth?: string;
  shadow?: string;
  paddingHeader?: string;
  paddingContent?: string;
  paddingFooter?: string;
}

export interface MimiComponentTokens {
  button?: MimiButtonTokens;
  input?: MimiInputTokens;
  card?: MimiCardTokens;
  // select y dialog se agregan con sus componentes (G1.5 y G1.6)
}

export interface MimiThemePreset {
  /** Solo informativo: no genera CSS. */
  name?: string;
  /** --mimi-radius */
  radius?: string;
  radii?: MimiRadiusTokens;
  colors?: MimiColorTokens;
  darkColors?: MimiColorTokens;
  shadows?: MimiShadowTokens;
  darkShadows?: MimiShadowTokens;
  fonts?: MimiFontTokens;
  motion?: MimiMotionTokens;
  effects?: MimiEffectTokens;
  controls?: MimiSharedTokens;
  components?: MimiComponentTokens;
}
