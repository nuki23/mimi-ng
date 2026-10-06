import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CodeBlock } from './code-block';
import { COMPONENT_TOKENS, type TokenComponent } from './component-tokens';

/**
 * Tabla «Variables CSS» de un componente, desde component-tokens.ts. Si el componente tiene
 * colores, muestra cómo cambiarlos en styles.css, en claro y en oscuro (spec 6.2).
 */
@Component({
  selector: 'app-css-variables',
  imports: [CodeBlock],
  template: `
    <p class="text-pretty">
      Se definen en tu styles.css o con el preset (<code
        class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]"
        >components.{{ component() }}</code
      >), salvo las de «Solo en CSS». Si no las defines, se usa la de «Hereda de» y, al final, el
      valor por defecto.
    </p>
    <div class="overflow-x-auto rounded-card border">
      <table class="w-full text-left text-sm">
        <thead class="bg-muted text-muted-foreground">
          <tr>
            <th scope="col" class="px-4 py-2.5 font-medium">Variable</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Por defecto</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Hereda de</th>
            <th scope="col" class="px-4 py-2.5 font-medium">Descripción</th>
          </tr>
        </thead>
        <tbody>
          @for (token of tokens(); track token.name) {
            <tr class="border-t align-top">
              <td class="px-4 py-2.5 font-mono text-[13px] whitespace-nowrap">{{ token.name }}</td>
              <td class="px-4 py-2.5 font-mono text-[13px]">{{ token.default }}</td>
              <td class="px-4 py-2.5 font-mono text-[13px] text-muted-foreground">
                {{ token.inherits ?? '—' }}
              </td>
              <td class="px-4 py-2.5 text-pretty">
                {{ token.description }}
                @if (token.deprecated) {
                  Nombre de la 0.1.0: usa {{ token.deprecated }} (se quita en la 1.0).
                } @else if (!token.preset) {
                  Solo en CSS.
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
    @if (colorExample(); as example) {
      <p class="text-sm text-pretty text-muted-foreground">
        Los colores cambian entre claro y oscuro, así que no van en el preset: defínelos en tu
        styles.css.
      </p>
      <app-code-block [code]="example" lang="css" />
    }
  `,
  host: { class: 'flex flex-col gap-3' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssVariables {
  readonly component = input.required<TokenComponent>();

  protected readonly tokens = computed(() => COMPONENT_TOKENS[this.component()]);

  /** Ejemplo con el primer color del componente (solo CSS), en claro y en oscuro. */
  protected readonly colorExample = computed(() => {
    const color = this.tokens().find((t) => !t.preset && !t.deprecated);
    if (!color) return null;
    return [
      '/* styles.css */',
      `:root {\n  ${color.name}: oklch(0.6 0.15 250);\n}`,
      `.dark {\n  ${color.name}: oklch(0.75 0.12 250);\n}`,
    ].join('\n');
  });
}
