import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Workout {
  id: string | number;
  name: string;
  description: string;
  difficulty: string;
  duration: number | string;
  category?: string;
  equipment?: string | null;
  targetArea?: string | null;
  targetAreas?: string[];
  target_area?: string | null;
  bodyPart?: string | null;
  level?: string | null;
  createdAt: string;
}

export interface WorkoutFilter {
  label: string;
  value: string;
}

export interface WorkoutQueryParams {
  body_part?: string;
  target_area?: string;
  // Backward-compatible aliases used by existing component state.
  bodyPart?: string;
  targetArea?: string;
  equipment?: string;
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface WorkoutsPaginatedResponse {
  success?: boolean;
  message?: string;
  workouts?: Workout[];
  data?: Workout[];
  items?: Workout[];
  total?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    itemsPerPage?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

export interface WorkoutsFiltersResponse {
  bodyParts?: string[];
  targetAreas?: string[];
  equipment?: Array<string | null>;
  levels?: string[];
}

export interface WorkoutsFiltersApiResponse {
  success?: boolean;
  message?: string;
  data?: WorkoutsFiltersResponse;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/workouts`;

  getWorkouts(params?: WorkoutQueryParams): Observable<Workout[] | WorkoutsPaginatedResponse> {
    let httpParams = new HttpParams();

    const bodyPart = params?.body_part ?? params?.bodyPart;
    if (bodyPart) {
      httpParams = httpParams.set('body_part', bodyPart);
    }

    const targetArea = params?.target_area ?? params?.targetArea;
    if (targetArea) {
      httpParams = httpParams.set('target_area', targetArea);
    }

    if (params?.equipment) {
      httpParams = httpParams.set('equipment', params.equipment);
    }

    if (params?.level) {
      httpParams = httpParams.set('level', params.level);
    }

    if (params?.search) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    if (params?.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }

    if (params?.limit != null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }

    return this.http.get<Workout[] | WorkoutsPaginatedResponse>(this.apiUrl, { params: httpParams });
  }

  getWorkoutsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }

  getFilters(): Observable<WorkoutsFiltersResponse | WorkoutsFiltersApiResponse> {
    return this.http.get<WorkoutsFiltersResponse | WorkoutsFiltersApiResponse>(`${this.apiUrl}/filters`);
  }

  getWorkout(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.apiUrl}/${id}`);
  }

  createWorkout(workout: Partial<Workout>): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, workout);
  }

  updateWorkout(id: string, workout: Partial<Workout>): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/${id}`, workout);
  }

  deleteWorkout(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
