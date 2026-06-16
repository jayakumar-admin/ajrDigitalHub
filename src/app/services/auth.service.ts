import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'client' | 'seller';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  constructor() {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('saas_token');
      const savedUser = localStorage.getItem('saas_user');
      if (savedToken && savedUser) {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
      }
    }
  }

  login(credentials: { username: string; password: string }) {
    return this.apiService.post<{ token: string; user: User }>('/auth/login', credentials).pipe(
      tap(res => {
        this.token.set(res.token);
        this.currentUser.set(res.user);
        localStorage.setItem('saas_token', res.token);
        localStorage.setItem('saas_user', JSON.stringify(res.user));
      })
    );
  }

  adminLogin(credentials: { username: string; password: string }) {
    return this.apiService.post<{ token: string; user: User }>('/admin/login', credentials).pipe(
      tap(res => {
        this.token.set(res.token);
        this.currentUser.set(res.user);
        localStorage.setItem('saas_token', res.token);
        localStorage.setItem('saas_user', JSON.stringify(res.user));
      })
    );
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_user');
    this.router.navigate(['/']);
  }

  isAdmin() {
    return this.currentUser()?.role === 'admin';
  }
}
