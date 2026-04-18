import { Component, OnInit, signal, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SavedWorkoutsService, SavedWorkout } from '../../core/services/saved-workouts.service';

@Component({
  selector: 'app-saved-workouts',
  imports: [TableModule, ButtonModule, CardModule, DatePipe],
  templateUrl: './saved-workouts.component.html',
  styleUrl: './saved-workouts.component.scss'
})
export class SavedWorkoutsComponent implements OnInit {
  private savedWorkoutsService = inject(SavedWorkoutsService);

  savedWorkouts = signal<SavedWorkout[]>([]);
  loading = signal(true);

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
      }
    });
  }

  viewSavedWorkout(savedWorkout: SavedWorkout) {
    console.log('View saved workout:', savedWorkout);
  }

  deleteSavedWorkout(savedWorkout: SavedWorkout) {
    console.log('Delete saved workout:', savedWorkout);
  }
}
