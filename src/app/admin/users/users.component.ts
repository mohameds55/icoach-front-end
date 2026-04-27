import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import {
  UsersService,
  User,
  UsersPaginatedResponse,
  UsersQueryParams,
} from '../../core/services/users.service';

interface PageEvent {
  first: number;
  rows: number;
}

@Component({
  selector: 'app-users',
  imports: [TableModule, ButtonModule, CardModule, TagModule, DatePipe],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);

  users = signal<User[]>([]);
  loading = signal(true);
  page = signal(1);
  limit = signal(10);
  totalRecords = signal(0);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(overrideParams?: Partial<UsersQueryParams>) {
    this.loading.set(true);
    const params: UsersQueryParams = {
      page: overrideParams?.page ?? this.page(),
      limit: overrideParams?.limit ?? this.limit(),
    };

    this.usersService.getUsers(params).subscribe({
      next: (response) => {
        const { users, total, page, limit } = this.mapUsersResponse(response);
        this.users.set(users);
        this.totalRecords.set(total);
        if (page != null) {
          this.page.set(page);
        }
        if (limit != null) {
          this.limit.set(limit);
        }
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.totalRecords.set(0);
        this.loading.set(false);
      },
    });
  }

  onPageChange(event: PageEvent) {
    const pageSizeChanged = event.rows !== this.limit();
    const page = pageSizeChanged ? 1 : Math.floor(event.first / event.rows) + 1;
    this.page.set(page);
    this.limit.set(event.rows);
    this.loadUsers({ page, limit: event.rows });
  }

  private mapUsersResponse(response: User[] | UsersPaginatedResponse): {
    users: User[];
    total: number;
    page?: number;
    limit?: number;
  } {
    if (Array.isArray(response)) {
      const users = response.map((user) => this.normalizeUser(user));
      return { users, total: users.length };
    }

    const rawUsers = response.users ?? response.data ?? response.items ?? [];
    const users = rawUsers.map((user) => this.normalizeUser(user));
    const total =
      response.pagination?.total ?? response.total ?? response.totalCount ?? users.length;
    const page = response.pagination?.page ?? response.page;
    const limit = response.pagination?.limit ?? response.limit;

    return { users, total, page, limit };
  }

  private normalizeUser(user: User): User {
    const firstName = user.firstName?.trim() ?? '';
    const lastName = user.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      ...user,
      name: (user.name ?? fullName) || (user.username ?? user.email),
      isVerified: user.isVerified ?? user.isEmailVerified ?? false,
    };
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
