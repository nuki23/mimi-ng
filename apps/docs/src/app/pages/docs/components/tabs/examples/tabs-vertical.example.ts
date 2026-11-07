import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-vertical-example',
  imports: [MimiTabsImports],
  template: `
    <div class="flex w-full flex-col gap-8">
      <!-- Vertical: ↑/↓ entre pestañas y el panel al lado. -->
      <mimi-tabs orientation="vertical" aria-label="Ajustes" class="w-40">
        <ng-template mimiTab="perfil" label="Perfil">Nombre, usuario y biografía.</ng-template>
        <ng-template mimiTab="avisos" label="Notificaciones">Correo y push.</ng-template>
        <ng-template mimiTab="seguridad" label="Seguridad">Dos pasos y sesiones.</ng-template>
      </mimi-tabs>
      <mimi-tabs orientation="vertical" variant="pill" aria-label="Ajustes (píldora)" class="w-44">
        <ng-template mimiTab="perfil" label="Perfil">Nombre, usuario y biografía.</ng-template>
        <ng-template mimiTab="avisos" label="Notificaciones">Correo y push.</ng-template>
        <ng-template mimiTab="seguridad" label="Seguridad">Dos pasos y sesiones.</ng-template>
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsVerticalExample {}
