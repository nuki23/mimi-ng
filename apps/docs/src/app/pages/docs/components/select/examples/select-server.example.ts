import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

interface User {
  id: number;
  name: string;
}

const USERS: User[] = [
  { id: 1, name: 'Ana Morales' },
  { id: 2, name: 'Bruno Díaz' },
  { id: 3, name: 'Camila Rojas' },
  { id: 4, name: 'Diego Peña' },
  { id: 5, name: 'Elena Vargas' },
  { id: 6, name: 'Fabián Ortiz' },
];

@Component({
  selector: 'app-select-server-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="select-server" class="text-sm font-medium">Responsable</label>
      <mimi-select
        id="select-server"
        placeholder="Busca una persona"
        search
        searchPlaceholder="Buscar por nombre…"
        searchMode="server"
        [(value)]="user"
        [loading]="loading()"
        [compareWith]="sameUser"
        (searchChange)="load($event)"
      >
        @for (u of users(); track u.id) {
          <mimi-option [value]="u">{{ u.name }}</mimi-option>
        }
      </mimi-select>
      <p class="font-mono text-[13px] text-muted-foreground">value: {{ user()?.name ?? 'null' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectServerExample {
  protected readonly user = signal<User | null>(null);
  protected readonly users = signal<User[]>(this.find(''));
  protected readonly loading = signal(false);

  // Los valores son objetos: se comparan por id.
  protected readonly sameUser = (a: User, b: User) => a.id === b.id;

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** Simula una petición al servidor. */
  protected load(query: string): void {
    clearTimeout(this.timer);
    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.users.set(this.find(query));
      this.loading.set(false);
    }, 600);
  }

  private find(query: string): User[] {
    return USERS.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));
  }
}
