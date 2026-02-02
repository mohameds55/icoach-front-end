import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin',
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
  }
];
