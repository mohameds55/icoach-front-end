import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, PanelMenuModule, ToolbarModule, ButtonModule],
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside class="h-screen w-64 border-r bg-white dark:bg-surface-900">
        <div class="flex h-16 items-center justify-center border-b px-4">
          <h1 class="text-xl font-bold text-surface-900 dark:text-surface-0">
            Boost Admin
          </h1>
        </div>
        <nav class="p-4">
          <p-panelMenu [model]="menuItems()" />
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <!-- Topbar -->
        <header class="sticky top-0 z-50 border-b bg-white dark:bg-surface-900">
          <p-toolbar>
            <ng-template pTemplate="start">
              <span class="text-lg font-semibold text-surface-900 dark:text-surface-0">
                Dashboard
              </span>
            </ng-template>
            <ng-template pTemplate="end">
              <p-button
                icon="pi pi-user"
                [text]="true"
                [rounded]="true"
                severity="secondary"
              />
            </ng-template>
          </p-toolbar>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto bg-surface-50 dark:bg-surface-950 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: ``
})
export class AdminLayoutComponent {
  menuItems = signal<MenuItem[]>([
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/admin/dashboard'
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      routerLink: '/admin/users'
    },
    {
      label: 'Workouts',
      icon: 'pi pi-bolt',
      routerLink: '/admin/workouts'
    },
    {
      label: 'Foods',
      icon: 'pi pi-apple',
      routerLink: '/admin/foods'
    },
    {
      label: 'Saved Workouts',
      icon: 'pi pi-bookmark',
      routerLink: '/admin/saved-workouts'
    }
  ]);
}
