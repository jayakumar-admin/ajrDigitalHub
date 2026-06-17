import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="min-h-[calc(100vh-16rem)] flex items-center justify-center p-6">
      <div class="w-full max-w-md bg-app-card border border-app-border rounded-3xl p-8 shadow-xl">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-indigo-600/10 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-[32px] w-[32px] h-[32px]">lock</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-app-text tracking-tight">Welcome Back</h1>
          <p class="text-sm text-app-muted mt-2">Sign in to manage your digital workspace</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-5">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-app-muted mb-2">Email Address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <mat-icon class="text-app-muted text-[18px] w-[18px] h-[18px]">email</mat-icon>
              </div>
              <input 
                type="email" 
                name="email" 
                [(ngModel)]="email" 
                required 
                placeholder="admin@ajr.com"
                class="w-full bg-app-bg text-app-text border border-app-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              >
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-app-muted mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <mat-icon class="text-app-muted text-[18px] w-[18px] h-[18px]">key</mat-icon>
              </div>
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                name="password" 
                [(ngModel)]="password" 
                required 
                placeholder="••••••••"
                class="w-full bg-app-bg text-app-text border border-app-border rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              >
              <button type="button" (click)="showPassword.set(!showPassword())" class="absolute inset-y-0 right-0 pr-3 flex items-center text-app-muted hover:text-indigo-500 transition-colors">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="!loginForm.valid || isLoading()"
            class="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            @if (isLoading()) {
              <mat-icon class="animate-spin text-[18px] w-[18px] h-[18px]">data_usage</mat-icon>
              Signing In...
            } @else {
              Sign In <mat-icon class="text-[18px] w-[18px] h-[18px]">arrow_forward</mat-icon>
            }
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-app-muted">
          Demo Admin: admin&#64;ajr.com / admin123
          <br>
          Demo User: user&#64;ajr.com / user123
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);

  onSubmit() {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success(`Welcome back!`);
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        // Error toast is handled by interceptor
      }
    });
  }
}
