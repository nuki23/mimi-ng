import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-shortcut-example',
  imports: [MimiTabsImports],
  template: `
    <div class="flex w-full flex-col gap-3">
      <mimi-tabs [(value)]="section" aria-label="Ajustes">
        <mimi-tab label="Perfil" value="profile">
          <p class="text-sm text-muted-foreground">Tu nombre y tu foto.</p>
        </mimi-tab>
        <mimi-tab label="Avisos" [count]="3">
          <p class="text-sm text-muted-foreground">Tienes 3 avisos sin leer.</p>
        </mimi-tab>
        <mimi-tab label="Privacidad">
          <p class="text-sm text-muted-foreground">Quién puede ver tu perfil.</p>
        </mimi-tab>
      </mimi-tabs>
      <p class="font-mono text-[13px] text-muted-foreground">value: {{ section() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsShortcutExample {
  // Sin `value`, el valor sale del texto: «Avisos» → `avisos`.
  protected readonly section = signal('profile');
}
