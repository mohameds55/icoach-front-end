import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
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
  imports: [
    TableModule,
    ButtonModule,
    CardModule,
    SelectModule,
    TooltipModule,
    InputTextModule,
    TextareaModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutsComponent implements OnInit {
  private workoutsService = inject(WorkoutsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

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

  dialogVisible = signal(false);
  dialogMode = signal<'create' | 'edit'>('create');
  saving = signal(false);
  selectedWorkout = signal<Workout | null>(null);

  gifFile = signal<File | null>(null);
  gifPreviewUrl = signal<string | null>(null);

  readonly levelSelectOptions: SelectOption[] = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    body_part: ['', Validators.required],
    target_area: ['', Validators.required],
    equipment: ['', Validators.required],
    level: ['', Validators.required],
    description: [''],
  });

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
        if (page != null) this.page.set(page);
        if (limit != null) this.limit.set(limit);
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

  openCreateDialog() {
    this.dialogMode.set('create');
    this.selectedWorkout.set(null);
    this.gifFile.set(null);
    this.gifPreviewUrl.set(null);
    this.form.reset();
    this.dialogVisible.set(true);
  }

  editWorkout(workout: Workout) {
    this.dialogMode.set('edit');
    this.selectedWorkout.set(workout);
    this.gifFile.set(null);
    this.gifPreviewUrl.set(workout.gif ?? null);
    this.form.reset({
      name: workout.name,
      body_part: workout.body_part ?? '',
      target_area: workout.target_area ?? '',
      equipment: workout.equipment ?? '',
      level: workout.level ?? '',
      description: workout.description ?? '',
    });
    this.dialogVisible.set(true);
  }

  onGifSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.type !== 'image/gif') {
      this.messageService.add({ severity: 'error', summary: 'Invalid File', detail: 'Only GIF files are allowed.' });
      input.value = '';
      return;
    }

    if (file.size > 7 * 1024 * 1024) {
      this.messageService.add({ severity: 'error', summary: 'File Too Large', detail: 'GIF must be under 7MB.' });
      input.value = '';
      return;
    }

    this.gifFile.set(file);
    this.gifPreviewUrl.set(URL.createObjectURL(file));
  }

  saveWorkout() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.dialogMode() === 'create' && !this.gifFile()) {
      this.messageService.add({ severity: 'error', summary: 'GIF Required', detail: 'Please upload a GIF file.' });
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    const fd = new FormData();
    fd.append('name', value.name!);
    fd.append('body_part', value.body_part!);
    fd.append('target_area', value.target_area!);
    fd.append('equipment', value.equipment!);
    fd.append('level', value.level!);
    if (value.description) fd.append('description', value.description);
    if (this.gifFile()) fd.append('gif', this.gifFile()!);

    if (this.dialogMode() === 'create') {
      this.workoutsService.createWorkout(fd).subscribe({
        next: (workout) => {
          const normalized = this.normalizeWorkout(workout);
          this.workouts.update((workouts) => [normalized, ...workouts]);
          this.totalRecords.update((t) => t + 1);
          this.dialogVisible.set(false);
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Workout Created',
            detail: `${normalized.name} has been created successfully.`,
          });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create workout. Please try again.',
          });
        },
      });
    } else {
      const workout = this.selectedWorkout()!;
      this.workoutsService.updateWorkout(String(workout.id), fd).subscribe({
        next: (updated) => {
          const normalized = this.normalizeWorkout(updated);
          this.workouts.update((workouts) =>
            workouts.map((w) => String(w.id) === String(normalized.id) ? normalized : w),
          );
          this.dialogVisible.set(false);
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Workout Updated',
            detail: `${normalized.name} has been updated successfully.`,
          });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update workout. Please try again.',
          });
        },
      });
    }
  }

  deleteWorkout(workout: Workout) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${workout.name}"? This action cannot be undone.`,
      header: 'Delete Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.workoutsService.deleteWorkout(String(workout.id)).subscribe({
          next: () => {
            this.workouts.update((workouts) =>
              workouts.filter((w) => String(w.id) !== String(workout.id)),
            );
            this.totalRecords.update((t) => Math.max(0, t - 1));
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: `${workout.name} has been deleted.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete workout. Please try again.',
            });
          },
        });
      },
    });
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
    return {
      ...workout,
      target_area: workout.target_area || 'N/A',
      equipment: workout.equipment || 'N/A',
    };
  }

  private mapOptions(values?: Array<string | null>): SelectOption[] {
    if (!values?.length) return [];

    return values
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => ({ label: value, value }));
  }
}
