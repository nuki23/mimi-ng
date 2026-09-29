/**
 * Preset tipado del tema (spec 6.3). Cada propiedad se convierte en una variable --mimi-*
 * de theme-base.css. Los derivados con color-mix (primary-hover, ring-soft, switch-off…)
 * no están aquí: se recalculan solos a partir de los colores.
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
  // select y dialog se agregan en la Fase 4
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
  controls?: MimiControlSizeTokens;
  components?: MimiComponentTokens;
}
