import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  sugar?: number;
  foodImage?: string;
  createdAt: string;
}

export interface FoodsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
}

export interface FoodsPaginatedResponse {
  success?: boolean;
  message?: string;
  foods?: Food[];
  data?: Food[];
  items?: Food[];
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

@Injectable({
  providedIn: 'root'
})
export class FoodsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/foods`;

  getFoods(params?: FoodsQueryParams): Observable<Food[] | FoodsPaginatedResponse> {
    let httpParams = new HttpParams();

    if (params?.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.search) httpParams = httpParams.set('search', params.search.trim());
    if (params?.minCalories != null) httpParams = httpParams.set('minCalories', String(params.minCalories));
    if (params?.maxCalories != null) httpParams = httpParams.set('maxCalories', String(params.maxCalories));
    if (params?.minProtein != null) httpParams = httpParams.set('minProtein', String(params.minProtein));

    return this.http.get<Food[] | FoodsPaginatedResponse>(this.apiUrl, { params: httpParams });
  }

  getFoodsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }

  getFood(id: string): Observable<Food> {
    return this.http.get<Food>(`${this.apiUrl}/${id}`);
  }

  createFood(data: FormData): Observable<Food> {
    return this.http.post<Food>(this.apiUrl, data);
  }

  updateFood(id: string, data: FormData): Observable<Food> {
    return this.http.put<Food>(`${this.apiUrl}/${id}`, data);
  }

  deleteFood(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
