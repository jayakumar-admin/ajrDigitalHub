import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  imports: [ReactiveFormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-height-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div id="login-container" class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- System Logo -->
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-600 shadow-lg text-white mb-6">
          <mat-icon class="text-3xl h-8 w-8 leading-none">dynamic_form</mat-icon>
        </div>
        
        <h2 class="text-center text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Dynamic Form Builder
        </h2>
        <p class="mt-2 text-center text-sm text-slate-500">
          Secure Form Creation & Response CRM System
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          
          <!-- Mode Selector (Login vs Register) -->
          <div class="flex border-b border-slate-100 pb-4 mb-6">
            <button 
              id="tab-login"
              (click)="isLoginMode.set(true)"
              class="flex-1 text-center font-medium pb-2 text-sm cursor-pointer transition-all border-b-2"
              [class.border-indigo-600]="isLoginMode()"
              [class.text-indigo-600]="isLoginMode()"
              [class.border-transparent]="!isLoginMode()"
              [class.text-slate-400]="!isLoginMode()"
            >
              Log In
            </button>
            <button 
              id="tab-register"
              (click)="isLoginMode.set(false)"
              class="flex-1 text-center font-medium pb-2 text-sm cursor-pointer transition-all border-b-2"
              [class.border-indigo-600]="!isLoginMode()"
              [class.text-indigo-600]="!isLoginMode()"
              [class.border-transparent]="isLoginMode()"
              [class.text-slate-400]="isLoginMode()"
            >
              Sign Up
            </button>
          </div>

          <!-- Toast notification panel -->
          @if (toastMessage()) {
            <div id="login-toast" 
              class="mb-4 p-3.5 rounded-xl flex items-start gap-2 border text-sm"
              [class]="toastType() === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border-rose-100 text-rose-800'"
            >
              <mat-icon class="text-base">{{ toastType() === 'success' ? 'check_circle' : 'error' }}</mat-icon>
              <span>{{ toastMessage() }}</span>
            </div>
          }

          <!-- Authentication Form -->
          <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700">Email Address</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-slate-400 text-base">mail</mat-icon>
                </div>
                <input 
                  id="email" 
                  formControlName="email"
                  type="email" 
                  class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                  placeholder="name@company.com"
                >
              </div>
              @if (f['email'].touched && f['email'].errors?.['required']) {
                <p class="mt-1 text-xs text-rose-500">Email is required</p>
              }
              @if (f['email'].touched && f['email'].errors?.['email']) {
                <p class="mt-1 text-xs text-rose-500">Please enter a valid email address</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
              <div class="mt-1 relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-slate-400 text-base">lock</mat-icon>
                </div>
                <input 
                  id="password" 
                  formControlName="password"
                  type="password" 
                  class="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
                  placeholder="••••••••"
                >
              </div>
              @if (f['password'].touched && f['password'].errors?.['required']) {
                <p class="mt-1 text-xs text-rose-500">Password is required</p>
              }
              @if (f['password'].touched && f['password'].errors?.['minlength']) {
                <p class="mt-1 text-xs text-rose-500">Password must be at least 6 characters</p>
              }
            </div>

            <!-- Role Selector (Visible only in register mode) -->
            @if (!isLoginMode()) {
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Account Role</label>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    (click)="selectedRole.set('user')"
                    [class]="selectedRole() === 'user'
                      ? 'flex items-center justify-center gap-2 py-2 px-3 border-2 border-indigo-600 bg-indigo-50/30 text-indigo-700 rounded-xl text-sm font-medium cursor-pointer'
                      : 'flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 text-slate-600 rounded-xl text-sm cursor-pointer hover:bg-slate-50'"
                  >
                    <mat-icon class="text-base">person</mat-icon>
                    SaaS Owner
                  </button>
                  <button 
                    type="button"
                    (click)="selectedRole.set('admin')"
                    [class]="selectedRole() === 'admin'
                      ? 'flex items-center justify-center gap-2 py-2 px-3 border-2 border-indigo-600 bg-indigo-50/30 text-indigo-700 rounded-xl text-sm font-medium cursor-pointer'
                      : 'flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 text-slate-600 rounded-xl text-sm cursor-pointer hover:bg-slate-50'"
                  >
                    <mat-icon class="text-base">admin_panel_settings</mat-icon>
                    Super Admin
                  </button>
                </div>
              </div>
            }

            <!-- Submit Button with Spinner -->
            <button 
              id="btn-auth-submit"
              type="submit" 
              [disabled]="authForm.invalid || isLoading()"
              class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all font-sans cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (isLoading()) {
                <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              } @else {
                <mat-icon class="text-base">{{ isLoginMode() ? 'login' : 'person_add' }}</mat-icon>
                {{ isLoginMode() ? 'Sign In Securely' : 'Create SaaS Account' }}
              }
            </button>
          </form>

          <!-- Quick Access Sandbox accounts (Awesome UX to log in with 1-click) -->
          <div class="mt-6 border-t border-slate-100 pt-5 text-center">
            <span class="text-xs text-slate-400 font-medium tracking-wide uppercase">Quick Login for Sandbox</span>
            <div class="mt-3 flex gap-2 justify-center">
              <button 
                id="btn-demo-owner"
                type="button" 
                (click)="fillDemo('owner@saas.com', 'user')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                <mat-icon class="text-xs w-4 h-4 leading-none text-slate-500">manage_accounts</mat-icon>
                Owner Demo
              </button>
              <button 
                id="btn-demo-admin"
                type="button" 
                (click)="fillDemo('admin@saas.com', 'admin')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                <mat-icon class="text-xs w-4 h-4 leading-none text-slate-500">security</mat-icon>
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoginMode = signal<boolean>(true);
  selectedRole = signal<'admin' | 'user'>('user');
  isLoading = signal<boolean>(false);
  
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error'>('success');

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get f() {
    return this.authForm.controls;
  }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 5000);
  }

  async fillDemo(email: string, role: 'admin' | 'user') {
    this.authForm.patchValue({
      email: email,
      password: 'demopassword123'
    });
    this.isLoginMode.set(true);
    // Explicit register of account if it doesn't exist behind-the-scenes
    this.isLoading.set(true);
    try {
      await this.authService.register(email, 'demopassword123', role);
    } catch (e) {
      // Catch silently if user already exists
    } finally {
      this.isLoading.set(false);
    }
    // Perform Login
    this.onSubmit();
  }

  async onSubmit() {
    if (this.authForm.invalid) { return; }
    
    this.isLoading.set(true);
    const email = this.authForm.value.email!;
    const password = this.authForm.value.password!;

    try {
      if (this.isLoginMode()) {
        const res = await this.authService.login(email, password);
        this.showToast('Logged in successfully!', 'success');
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          this.router.navigateByUrl(redirectUrl);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        const role = this.selectedRole();
        await this.authService.register(email, password, role);
        this.showToast('Account registered! You can now log in.', 'success');
        this.isLoginMode.set(true);
      }
    } catch (err: any) {
      this.showToast(err.message || 'Authentication failed', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
}
