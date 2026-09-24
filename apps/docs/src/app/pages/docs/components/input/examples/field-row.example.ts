import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideSearch } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiInput } from '@/components/ui/input';
import { MimiTextarea } from '@/components/ui/textarea';

@Component({
  selector: 'app-field-row-example',
  imports: [MimiButton, MimiInput, MimiTextarea, LucideSearch],
  template: `
    <div class="flex w-full max-w-xl items-start gap-2">
      <input mimiInput placeholder="Buscar componente" aria-label="Buscar componente" />
      <textarea
        mimiTextarea
        rows="1"
        class="resize-none"
        placeholder="Nota"
        aria-label="Nota"
      ></textarea>
      <button mimiBtn>
        <svg lucideSearch></svg>
        Buscar
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldRowExample {}
