import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FoodsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/foods';

  getFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(this.apiUrl);
  }

  getFoodsCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`);
  }

  searchFoods(query: string): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.apiUrl}/search?q=${query}`);
  }

  getHighProteinFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.apiUrl}/high-protein`);
  }

  getLowCalorieFoods(): Observable<Food[]> {
    return this.http.get<Food[]>(`${this.apiUrl}/low-calorie`);
  }

  getFood(id: string): Observable<Food> {
    return this.http.get<Food>(`${this.apiUrl}/${id}`);
  }

  createFood(food: Partial<Food>): Observable<Food> {
    return this.http.post<Food>(this.apiUrl, food);
  }

  updateFood(id: string, food: Partial<Food>): Observable<Food> {
    return this.http.put<Food>(`${this.apiUrl}/${id}`, food);
  }

  deleteFood(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
