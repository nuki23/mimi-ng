import { Directive } from '@angular/core';

/**
 * Clases de `<button mimiBtn variant="ghost" size="icon">` con las de la cabecera (36px, radio y
 * ícono de 18px), ya fusionadas por `cn()` y escritas como literal (M.25). Así la cabecera y el
 * menú móvil no traen Button ni `tailwind-merge` al bundle inicial (`main`). La prueba
 * `icon-button.spec.ts` comprueba que siguen siendo iguales a las de Button: si cambia Button,
 * falla y hay que copiar la cadena nueva.
 */
export const SITE_ICON_BUTTON_CLASSES =
  'relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap select-none border-[length:var(--mimi-btn-border-width,1px)] border-transparent font-sans leading-none font-[weight:var(--mimi-btn-font-weight,500)] tracking-[var(--mimi-btn-letter-spacing,normal)] [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-[length:var(--mimi-btn-focus-ring-width,2px)] disabled:cursor-not-allowed disabled:opacity-[var(--mimi-disabled-opacity,0.5)] aria-disabled:pointer-events-none aria-disabled:opacity-[var(--mimi-disabled-opacity,0.5)] mimi-transition active:not-aria-busy:scale-[var(--mimi-btn-press-scale,var(--mimi-press-scale))] aria-busy:disabled:cursor-progress aria-busy:disabled:opacity-85 aria-busy:aria-disabled:opacity-85 [button&]:aria-busy:cursor-progress [button&]:aria-busy:data-loading:pointer-events-auto p-0 bg-transparent text-foreground hover:not-disabled:not-aria-busy:bg-accent hover:not-disabled:not-aria-busy:text-accent-foreground size-9 rounded-[min(var(--mimi-radius),10px)] [&_svg]:size-[18px]';

/**
 * Botón de ícono del sitio (cabecera y menú móvil): el aspecto de `mimiBtn` fantasma de ícono sin
 * su lógica (no hay `loading` ni `disabled` en estos botones). Las clases propias de cada botón
 * (`-ml-2`, `lg:hidden`) se suman en el elemento y no chocan con estas.
 */
@Directive({
  selector: 'button[appIconBtn], a[appIconBtn]',
  host: { class: SITE_ICON_BUTTON_CLASSES },
})
export class SiteIconButton {}
