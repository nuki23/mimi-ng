import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-preview-demo-example',
  template: `
    <form class="flex w-80 flex-col gap-3" (submit)="$event.preventDefault(); sent.set(true)">
      <label for="demo-email" class="text-sm font-medium">Correo</label>
      <input
        id="demo-email"
        type="email"
        placeholder="tu@correo.com"
        class="h-(--mimi-control-height) rounded-lg border border-input bg-input-background px-3 text-sm outline-none mimi-transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring-soft"
      />
      <button
        type="submit"
        class="h-(--mimi-control-height) rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-primary mimi-transition hover:bg-primary-hover hover:shadow-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-(--mimi-press-scale)"
      >
        {{ sent() ? 'Enviado' : 'Suscribirme' }}
      </button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewDemoExample {
  protected readonly sent = signal(false);
}
