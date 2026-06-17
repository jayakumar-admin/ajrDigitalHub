import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // States using Angular Signals
  currentUser = signal<User | null>(null);
  accessToken = signal<string | null>(null);

  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    const storedUser = localStorage.getItem('form_builder_user');
    const storedToken = localStorage.getItem('form_builder_token');
    if (storedUser && storedToken) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
        this.accessToken.set(storedToken);
      } catch (err) {
        this.clearSession();
      }
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.http.post<any>('/api/auth/login', { email, password })
      );
      if (res && res.accessToken) {
        this.sessionSuccess(res.user, res.accessToken);
        return res;
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err: any) {
      throw new Error(err.error?.message || err.message || 'Login failed');
    }
  }

  async register(email: string, password: string, role: 'admin' | 'user'): Promise<any> {
    try {
      const res: any = await firstValueFrom(
        this.http.post<any>('/api/auth/register', { email, password, role })
      );
      return res;
    } catch (err: any) {
      throw new Error(err.error?.message || err.message || 'Fail to register');
    }
  }

  async tryRefresh(): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(this.http.post<any>('/api/auth/refresh', {}));
      if (res && res.accessToken) {
        this.accessToken.set(res.accessToken);
        localStorage.setItem('form_builder_token', res.accessToken);
        return true;
      }
    } catch (e) {
      this.clearSession();
    }
    return false;
  }

  logout() {
    this.http.post<any>('/api/auth/logout', {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  clearSession() {
    this.currentUser.set(null);
    this.accessToken.set(null);
    localStorage.removeItem('form_builder_user');
    localStorage.removeItem('form_builder_token');
    this.router.navigate(['/login']);
  }

  private sessionSuccess(user: User, token: string) {
    this.currentUser.set(user);
    this.accessToken.set(token);
    localStorage.setItem('form_builder_user', JSON.stringify(user));
    localStorage.setItem('form_builder_token', token);
  }
}
