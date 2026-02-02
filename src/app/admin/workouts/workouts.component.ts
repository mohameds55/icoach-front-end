import { Component, OnInit, signal, inject } from '@angular/core';import { FormsModule } from '@angular/forms';import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { WorkoutsService, Workout, WorkoutFilter } from '../../core/services/workouts.service';

@Component({
  selector: 'app-workouts',
  imports: [TableModule, ButtonModule, CardModule, SelectModule, FormsModule, DatePipe],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Workout Management</h2>
        <p-button label="Create Workout" icon="pi pi-plus" (onClick)="createWorkout()" />
      </div>

      <!-- Filter Bar -->
      <div class="flex gap-4">
        <p-select
          [options]="filters()"
          [(ngModel)]="selectedFilter"
          optionLabel="label"
          placeholder="Filter by category"
          [showClear]="true"
          class="flex-1 max-w-xs"
        />
      </div>

      <p-card class="rounded-xl shadow-sm">
        <p-table
          [value]="workouts()"
          [loading]="loading()"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} workouts"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">Name <p-sortIcon field="name" /></th>
              <th>Description</th>
              <th pSortableColumn="difficulty">Difficulty <p-sortIcon field="difficulty" /></th>
              <th pSortableColumn="duration">Duration (min) <p-sortIcon field="duration" /></th>
              <th pSortableColumn="category">Category <p-sortIcon field="category" /></th>
              <th pSortableColumn="createdAt">Created At <p-sortIcon field="createdAt" /></th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-workout>
            <tr>
              <td>{{ workout.name }}</td>
              <td>
                <div class="max-w-xs truncate">{{ workout.description }}</div>
              </td>
              <td>
                <span class="capitalize">{{ workout.difficulty }}</span>
              </td>
              <td>{{ workout.duration }}</td>
              <td>{{ workout.category }}</td>
              <td>{{ workout.createdAt | date: 'short' }}</td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    (onClick)="editWorkout(workout)"
                  />
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="deleteWorkout(workout)"
                  />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center py-8 text-surface-500">No workouts found</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: ``,
})
export class WorkoutsComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);

  workouts = signal<Workout[]>([]);
  filters = signal<WorkoutFilter[]>([]);
  loading = signal(true);
  selectedFilter: WorkoutFilter | null = null;

  ngOnInit() {
    this.loadWorkouts();
    this.loadFilters();
  }

  loadWorkouts() {
    this.loading.set(true);
    this.workoutsService.getWorkouts().subscribe({
      next: (workouts) => {
        this.workouts.set(workouts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadFilters() {
    this.workoutsService.getFilters().subscribe({
      next: (filters) => {
        this.filters.set(filters);
      },
    });
  }

  createWorkout() {
    console.log('Create workout');
  }

  editWorkout(workout: Workout) {
    console.log('Edit workout:', workout);
  }

  deleteWorkout(workout: Workout) {
    console.log('Delete workout:', workout);
  }
}
