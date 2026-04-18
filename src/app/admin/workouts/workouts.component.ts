import { Component, OnInit, signal, inject } from '@angular/core';import { FormsModule } from '@angular/forms';import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { WorkoutsService, Workout, WorkoutFilter } from '../../core/services/workouts.service';

@Component({
  selector: 'app-workouts',
  imports: [TableModule, ButtonModule, CardModule, SelectModule, FormsModule, DatePipe],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.scss',
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
