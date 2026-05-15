import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
}

export interface UsersPaginatedResponse {
  success?: boolean;
  message?: string;
  users?: User[];
  data?: User[];
  items?: User[];
  total?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUsers(params?: UsersQueryParams): Observable<User[] | UsersPaginatedResponse> {
    let httpParams = new HttpParams();

    if (params?.page != null) {
      httpParams = httpParams.set('page', String(params.page));
    }

    if (params?.limit != null) {
      httpParams = httpParams.set('limit', String(params.limit));
    }

    return this.http.get<User[] | UsersPaginatedResponse>(this.apiUrl, { params: httpParams });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
