import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  adminName = signal('Admin');
  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  mainNavItems = signal<NavItem[]>([
    { label: 'Overview', icon: 'pi pi-home', route: '/admin/dashboard' },
    { label: 'Users', icon: 'pi pi-users', route: '/admin/users' },
    { label: 'Workouts', icon: 'pi pi-bolt', route: '/admin/workouts' },
    { label: 'Foods', icon: 'pi pi-apple', route: '/admin/foods' },
    { label: 'Saved Plans', icon: 'pi pi-bookmark', route: '/admin/saved-workouts' },
  ]);
}
