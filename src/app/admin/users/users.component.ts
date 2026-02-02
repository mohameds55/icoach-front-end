import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { UsersService, User } from '../../core/services/users.service';

@Component({
  selector: 'app-users',
  imports: [TableModule, ButtonModule, CardModule, TagModule, DatePipe],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">User Management</h2>
        <p-button label="Add User" icon="pi pi-plus" />
      </div>

      <p-card class="rounded-xl shadow-sm">
        <p-table
          [value]="users()"
          [loading]="loading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">
                Name <p-sortIcon field="name" />
              </th>
              <th pSortableColumn="email">
                Email <p-sortIcon field="email" />
              </th>
              <th pSortableColumn="role">
                Role <p-sortIcon field="role" />
              </th>
              <th>Status</th>
              <th pSortableColumn="createdAt">
                Created At <p-sortIcon field="createdAt" />
              </th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="capitalize">{{ user.role }}</span>
              </td>
              <td>
                <p-tag
                  [value]="user.isVerified ? 'Verified' : 'Unverified'"
                  [severity]="user.isVerified ? 'success' : 'warn'"
                />
              </td>
              <td>{{ user.createdAt | date: 'short' }}</td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="viewUser(user)"
                  />
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    (onClick)="editUser(user)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="deleteUser(user)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8 text-surface-500">
                No users found
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: ``
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);

  users = signal<User[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  viewUser(user: User) {
    console.log('View user:', user);
  }

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    console.log('Delete user:', user);
  }
}
