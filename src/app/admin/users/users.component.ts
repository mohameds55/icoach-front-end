import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
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
  imports: [
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    DatePipe,
    DialogModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    ReactiveFormsModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  loading = signal(true);
  page = signal(1);
  limit = signal(10);
  totalRecords = signal(0);

  dialogVisible = signal(false);
  viewDialogVisible = signal(false);
  saving = signal(false);
  selectedUser = signal<User | null>(null);

  readonly roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
    { label: 'Coach', value: 'coach' },
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user', Validators.required],
    password: [''],
    isVerified: [false],
    isActive: [true],
  });

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
        if (page != null) this.page.set(page);
        if (limit != null) this.limit.set(limit);
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

  viewUser(user: User) {
    this.selectedUser.set(user);
    this.viewDialogVisible.set(true);
  }

  editUser(user: User) {
    this.selectedUser.set(user);
    this.form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      isVerified: user.isVerified,
      isActive: user.isActive ?? true,
    });
    this.dialogVisible.set(true);
  }

  saveUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload: Record<string, unknown> = {
      name: value.name!,
      email: value.email!,
      role: value.role!,
      isVerified: value.isVerified!,
      isActive: value.isActive!,
    };
    if (value.password) payload['password'] = value.password;

    const user = this.selectedUser()!;
    this.usersService.updateUser(String(user.id), payload as Partial<User>).subscribe({
      next: (updated) => {
        const normalized = this.normalizeUser(updated);
        this.users.update((users) =>
          users.map((u) => String(u.id) === String(normalized.id) ? normalized : u),
        );
        this.dialogVisible.set(false);
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'User Updated',
          detail: `${normalized.name} has been updated successfully.`,
        });
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update user. Please try again.',
        });
      },
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.deleteUser(String(user.id)).subscribe({
          next: () => {
            this.users.update((users) => users.filter((u) => String(u.id) !== String(user.id)));
            this.totalRecords.update((t) => Math.max(0, t - 1));
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${user.name} has been deleted.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete user. Please try again.',
            });
          },
        });
      },
    });
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
      isActive: user.isActive ?? true,
    };
  }
}
