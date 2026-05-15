import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Workout {
  id: string | number;
  name: string;
  description?: string;
  body_part: string;
  target_area: string;
  equipment: string;
  level: string;
  gif?: string;
  createdAt: string;
}

export interface WorkoutFilter {
  label: string;
  value: string;
}

export interface WorkoutQueryParams {
  body_part?: string;
  target_area?: string;
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

    if (params?.body_part) httpParams = httpParams.set('body_part', params.body_part);
    if (params?.target_area) httpParams = httpParams.set('target_area', params.target_area);
    if (params?.equipment) httpParams = httpParams.set('equipment', params.equipment);
    if (params?.level) httpParams = httpParams.set('level', params.level);
    if (params?.search) httpParams = httpParams.set('search', params.search.trim());
    if (params?.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));

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

  createWorkout(data: FormData): Observable<Workout> {
    return this.http.post<Workout>(this.apiUrl, data);
  }

  updateWorkout(id: string, data: FormData): Observable<Workout> {
    return this.http.put<Workout>(`${this.apiUrl}/${id}`, data);
  }

  deleteWorkout(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
