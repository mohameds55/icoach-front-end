import { Component, OnInit, signal, inject } from '@angular/core';import { FormsModule } from '@angular/forms';import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import {
  WorkoutsService,
  Workout,
  WorkoutsPaginatedResponse,
  WorkoutQueryParams,
  WorkoutsFiltersApiResponse,
  WorkoutsFiltersResponse,
} from '../../core/services/workouts.service';

interface SelectOption {
  label: string;
  value: string;
}

interface PageEvent {
  first: number;
  rows: number;
}

@Component({
  selector: 'app-workouts',
  imports: [TableModule, ButtonModule, CardModule, SelectModule, TooltipModule, FormsModule, DatePipe],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.scss',
})
export class WorkoutsComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);

  workouts = signal<Workout[]>([]);
  bodyPartOptions = signal<SelectOption[]>([]);
  targetAreaOptions = signal<SelectOption[]>([]);
  equipmentOptions = signal<SelectOption[]>([]);
  levelOptions = signal<SelectOption[]>([]);
  loading = signal(true);
  page = signal(1);
  limit = signal(10);
  totalRecords = signal(0);

  selectedBodyPart: string | null = null;
  selectedTargetArea: string | null = null;
  selectedEquipment: string | null = null;
  selectedLevel: string | null = null;

  ngOnInit() {
    this.loadWorkouts();
    this.loadFilters();
  }

  loadWorkouts(overrideParams?: Partial<WorkoutQueryParams>) {
    this.loading.set(true);
    const params: WorkoutQueryParams = {
      body_part: this.selectedBodyPart ?? undefined,
      target_area: this.selectedTargetArea ?? undefined,
      equipment: this.selectedEquipment ?? undefined,
      level: this.selectedLevel ?? undefined,
      page: overrideParams?.page ?? this.page(),
      limit: overrideParams?.limit ?? this.limit(),
    };

    this.workoutsService.getWorkouts(params).subscribe({
      next: (response) => {
        const { workouts, total, page, limit } = this.mapWorkoutsResponse(response);
        this.workouts.set(workouts);
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
        this.workouts.set([]);
        this.totalRecords.set(0);
        this.loading.set(false);
      },
    });
  }

  loadFilters() {
    this.workoutsService.getFilters().subscribe({
      next: (response) => {
        const filters = this.unwrapFiltersResponse(response);
        this.setFilterOptions(filters);
      },
      error: () => {
        this.bodyPartOptions.set([]);
        this.targetAreaOptions.set([]);
        this.equipmentOptions.set([]);
        this.levelOptions.set([]);
      },
    });
  }

  onFilterChange() {
    this.page.set(1);
    this.loadWorkouts({ page: 1 });
  }

  clearFilters() {
    this.selectedBodyPart = null;
    this.selectedTargetArea = null;
    this.selectedEquipment = null;
    this.selectedLevel = null;
    this.page.set(1);
    this.loadWorkouts({ page: 1 });
  }

  onPageChange(event: PageEvent) {
    const pageSizeChanged = event.rows !== this.limit();
    const page = pageSizeChanged ? 1 : Math.floor(event.first / event.rows) + 1;
    this.page.set(page);
    this.limit.set(event.rows);
    this.loadWorkouts({ page, limit: event.rows });
  }

  private setFilterOptions(filters: WorkoutsFiltersResponse) {
    this.bodyPartOptions.set(this.mapOptions(filters.bodyParts));
    this.targetAreaOptions.set(this.mapOptions(filters.targetAreas));
    this.equipmentOptions.set(this.mapOptions(filters.equipment));
    this.levelOptions.set(this.mapOptions(filters.levels));
  }

  private unwrapFiltersResponse(
    response: WorkoutsFiltersResponse | WorkoutsFiltersApiResponse,
  ): WorkoutsFiltersResponse {
    if ('data' in response && response.data) {
      return response.data;
    }

    return response as WorkoutsFiltersResponse;
  }

  private mapWorkoutsResponse(response: Workout[] | WorkoutsPaginatedResponse): {
    workouts: Workout[];
    total: number;
    page?: number;
    limit?: number;
  } {
    if (Array.isArray(response)) {
      const workouts = response.map((workout) => this.normalizeWorkout(workout));
      return { workouts, total: workouts.length };
    }

    const rawWorkouts = response.workouts ?? response.data ?? response.items ?? [];
    const workouts = rawWorkouts.map((workout) => this.normalizeWorkout(workout));
    const total =
      response.pagination?.totalItems ??
      response.pagination?.total ??
      response.total ??
      response.totalCount ??
      workouts.length;
    const page = response.pagination?.currentPage ?? response.pagination?.page ?? response.page;
    const limit = response.pagination?.itemsPerPage ?? response.pagination?.limit ?? response.limit;

    return { workouts, total, page, limit };
  }

  private normalizeWorkout(workout: Workout): Workout {
    const targetArea =
      workout.targetArea ??
      workout.target_area ??
      (Array.isArray(workout.targetAreas) ? workout.targetAreas.join(', ') : null);

    return {
      ...workout,
      targetArea: targetArea || 'N/A',
      equipment: workout.equipment ?? 'N/A',
    };
  }

  private mapOptions(values?: Array<string | null>): SelectOption[] {
    if (!values?.length) {
      return [];
    }

    return values
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => ({
        label: value,
        value,
      }));
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
