import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

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
  private authService = inject(AuthService);
  private router = inject(Router);

  adminName = signal('Admin');
  sidebarOpen = signal(false);
  userMenuOpen = signal(false);
  loggingOut = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
  }

  closeUserMenu() {
    this.userMenuOpen.set(false);
  }

  logout() {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);

    this.authService
      .logout()
      .pipe(finalize(() => this.loggingOut.set(false)))
      .subscribe({
        next: () => {
          this.finishLogout();
        },
        error: () => {
          // If backend logout fails, still clear local session and redirect.
          this.finishLogout();
        },
      });
  }

  private finishLogout() {
    this.authService.clearToken();
    this.closeSidebar();
    this.closeUserMenu();
    this.router.navigateByUrl('/auth/login');
  }

  mainNavItems = signal<NavItem[]>([
    { label: 'Overview', icon: 'pi pi-home', route: '/admin/dashboard' },
    { label: 'Users', icon: 'pi pi-users', route: '/admin/users' },
    { label: 'Workouts', icon: 'pi pi-bolt', route: '/admin/workouts' },
    { label: 'Foods', icon: 'pi pi-apple', route: '/admin/foods' },
    { label: 'Saved Plans', icon: 'pi pi-bookmark', route: '/admin/saved-workouts' },
  ]);
}
