import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SavedWorkoutsService, SavedWorkout } from '../../core/services/saved-workouts.service';

@Component({
  selector: 'app-saved-workouts',
  imports: [
    TableModule,
    ButtonModule,
    CardModule,
    DatePipe,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './saved-workouts.component.html',
  styleUrl: './saved-workouts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SavedWorkoutsComponent implements OnInit {
  private savedWorkoutsService = inject(SavedWorkoutsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  savedWorkouts = signal<SavedWorkout[]>([]);
  loading = signal(true);
  viewDialogVisible = signal(false);
  selectedWorkout = signal<SavedWorkout | null>(null);

  ngOnInit() {
    this.loadSavedWorkouts();
  }

  loadSavedWorkouts() {
    this.loading.set(true);
    this.savedWorkoutsService.getSavedWorkouts().subscribe({
      next: (savedWorkouts) => {
        this.savedWorkouts.set(savedWorkouts);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  viewSavedWorkout(savedWorkout: SavedWorkout) {
    this.selectedWorkout.set(savedWorkout);
    this.viewDialogVisible.set(true);
  }

  deleteSavedWorkout(savedWorkout: SavedWorkout) {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove "${savedWorkout.workoutName}" from saved workouts?`,
      header: 'Remove Saved Workout',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.savedWorkoutsService.deleteSavedWorkout(savedWorkout.id).subscribe({
          next: () => {
            this.savedWorkouts.update((workouts) =>
              workouts.filter((w) => w.id !== savedWorkout.id),
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Removed',
              detail: `${savedWorkout.workoutName} has been removed from saved workouts.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to remove saved workout. Please try again.',
            });
          },
        });
      },
    });
  }
}
