import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, Role } from '../models/auth.model';

const STORAGE_KEY = 'auth';

interface StoredAuth {
  username: string;
  role: Role;
  credentials: string; 
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  currentUser = signal<{ username: string; role: Role } | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { username, password };

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap((response) => {
          const stored: StoredAuth = {
            username: response.username,
            role: response.role,
            credentials: btoa(`${username}:${password}`)
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
          this.currentUser.set({ username: stored.username, role: stored.role });
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(...roles: Role[]): boolean {
    const user = this.currentUser();
    return user !== null && roles.includes(user.role);
  }

  getAuthHeader(): string | null {
    const stored = this.readStoredAuth();
    return stored ? `Basic ${stored.credentials}` : null;
  }

  private readStoredAuth(): StoredAuth | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  }

  private readStoredUser(): { username: string; role: Role } | null {
    const stored = this.readStoredAuth();
    return stored ? { username: stored.username, role: stored.role } : null;
  }
}
