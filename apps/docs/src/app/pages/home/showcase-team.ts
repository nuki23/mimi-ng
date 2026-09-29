import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideUserPlus } from '@lucide/angular';
import { MimiAvatarImports } from '@/components/ui/avatar';
import { MimiBadge } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';

interface Member {
  initials: string;
  name: string;
  mail: string;
  role: string;
}

/** Persona de ejemplo que agrega «Invitar persona». */
const INVITED: Member = {
  initials: 'LP',
  name: 'Lucía Pérez',
  mail: 'lucia@empresa.com',
  role: 'Lectura',
};

/** Vitrina de la landing: Card, Avatar, Badge y Button con datos de ejemplo. */
@Component({
  selector: 'app-showcase-team',
  imports: [MimiCardImports, MimiAvatarImports, MimiBadge, MimiButton, LucideUserPlus],
  template: `
    <mimi-card>
      <mimi-card-header>
        <mimi-card-title class="font-bold">Equipo</mimi-card-title>
        <mimi-card-description>{{ members().length }} personas con acceso.</mimi-card-description>
      </mimi-card-header>
      <mimi-card-content>
        <ul class="flex flex-col">
          @for (member of members(); track member.mail) {
            <li class="flex items-center gap-3 border-b py-2.5">
              <mimi-avatar class="size-9 text-[13px]">
                <mimi-avatar-fallback [label]="member.name">{{
                  member.initials
                }}</mimi-avatar-fallback>
              </mimi-avatar>
              <div class="flex min-w-0 flex-1 flex-col leading-[1.35]">
                <span class="text-sm font-semibold">{{ member.name }}</span>
                <span class="truncate text-[13px] text-muted-foreground">{{ member.mail }}</span>
              </div>
              <span mimiBadge variant="outline">{{ member.role }}</span>
            </li>
          }
        </ul>
      </mimi-card-content>
      <mimi-card-footer>
        <button mimiBtn variant="ghost" class="w-full" [disabled]="invited()" (click)="invite()">
          <svg lucideUserPlus aria-hidden="true"></svg>
          Invitar persona
        </button>
      </mimi-card-footer>
    </mimi-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseTeam {
  protected readonly members = signal<Member[]>([
    { initials: 'AT', name: 'Ana Torres', mail: 'ana@empresa.com', role: 'Admin' },
    { initials: 'JR', name: 'Julián Ríos', mail: 'julian@empresa.com', role: 'Editor' },
    { initials: 'MG', name: 'Marta Gil', mail: 'marta@empresa.com', role: 'Lectura' },
  ]);
  /** Solo se puede invitar una vez: es una demostración. */
  protected readonly invited = signal(false);

  protected invite(): void {
    this.members.update((members) => [...members, INVITED]);
    this.invited.set(true);
  }
}
