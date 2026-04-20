import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterPayload {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'admin';
}

export interface LoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private authApiUrl = `${environment.apiUrl}/users`;

  private tokenSignal = signal<string | null>(this.getStoredToken());

  readonly token = this.tokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.tokenSignal()));

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authApiUrl}/register`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authApiUrl}/login`, payload)
      .pipe(
        tap((response) => {
          const token = this.extractToken(response);
          if (token) {
            this.setToken(token);
          }
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authApiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearToken();
      })
    );
  }

  clearToken(): void {
    this.tokenSignal.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return this.tokenSignal() ?? this.getStoredToken();
  }

  private setToken(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem('auth_token', token);
  }

  private getStoredToken(): string | null {
    return (
      localStorage.getItem('auth_token') ??
      localStorage.getItem('access_token') ??
      localStorage.getItem('token')
    );
  }

  private extractToken(response: AuthResponse): string | null {
    return response.token ?? response.accessToken ?? response.data?.token ?? response.data?.accessToken ?? null;
  }
}
