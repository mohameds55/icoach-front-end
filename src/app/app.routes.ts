import { Routes } from '@angular/router';
import { authChildGuard, authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'workouts',
        loadComponent: () => import('./admin/workouts/workouts.component').then(m => m.WorkoutsComponent)
      },
      {
        path: 'foods',
        loadComponent: () => import('./admin/foods/foods.component').then(m => m.FoodsComponent)
      },
      {
        path: 'saved-workouts',
        loadComponent: () => import('./admin/saved-workouts/saved-workouts.component').then(m => m.SavedWorkoutsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
