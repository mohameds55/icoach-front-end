import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SavedWorkout {
  id: string;
  userId: string;
  workoutId: string;
  workoutName: string;
  savedAt: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SavedWorkoutsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/saved-workouts';

  getSavedWorkouts(): Observable<SavedWorkout[]> {
    return this.http.get<SavedWorkout[]>(this.apiUrl);
  }

  getSavedWorkoutsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }

  getSavedWorkout(id: string): Observable<SavedWorkout> {
    return this.http.get<SavedWorkout>(`${this.apiUrl}/${id}`);
  }

  deleteSavedWorkout(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
