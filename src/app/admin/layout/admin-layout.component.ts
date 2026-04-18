import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, PanelMenuModule, ToolbarModule, ButtonModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
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
