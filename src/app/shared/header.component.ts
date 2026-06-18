import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { ThemeService, AppTheme } from '../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <header class="sticky top-0 z-[40] w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10 select-none">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Logo Branding -->
        <a routerLink="/" class="flex items-center gap-2.5 group cursor-pointer focus:outline-none">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-all">
            <mat-icon class="text-lg h-5 w-5 leading-none !text-[20px] !w-[20px] !h-[20px]">ac_unit</mat-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-black text-white uppercase tracking-wider font-display">AJR Digital Hub</span>
            <span class="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-widest leading-none">Enterprise Cluster</span>
          </div>
        </a>

        <!-- Main Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
          <a 
            routerLink="/home" 
            routerLinkActive="bg-white/10 text-white font-bold"
            class="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all"
          >
            Home
          </a>
          <a 
            routerLink="/marketplace" 
            routerLinkActive="bg-white/10 text-white font-bold"
            class="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all"
          >
            Asset Matrix
          </a>
          <a 
            routerLink="/services" 
            routerLinkActive="bg-white/10 text-white font-bold"
            class="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all"
          >
            Core Services
          </a>
          <a 
            routerLink="/invoice-builder" 
            routerLinkActive="bg-white/10 text-white font-bold"
            class="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all"
          >
            Invoice Builder
          </a>
          @if (isAuthenticated()) {
            <a 
              routerLink="/dashboard" 
              routerLinkActive="bg-white/10 text-white font-bold"
              class="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-all"
            >
              Dashboard
            </a>
          }
        </nav>

        <!-- Right Side: Auth / Actions -->
        <div class="flex items-center gap-3">
          <!-- Active cluster indicator -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Node Online
          </div>

          <!-- Divider -->
          <span class="hidden sm:block h-5 w-px bg-white/10"></span>
          
          <!-- Theme Toggle -->
          <button (click)="toggleTheme()" class="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all border border-white/5 flex items-center justify-center" [title]="'Current Theme: ' + themeService.currentTheme()">
            <mat-icon *ngIf="themeService.currentTheme() === 'dark'" class="!text-[20px] !w-[20px] !h-[20px]">dark_mode</mat-icon>
            <mat-icon *ngIf="themeService.currentTheme() === 'light'" class="!text-[20px] !w-[20px] !h-[20px]">light_mode</mat-icon>
            <mat-icon *ngIf="themeService.currentTheme() === 'neon'" class="!text-[20px] !w-[20px] !h-[20px] text-pink-400">flare</mat-icon>
          </button>

          <!-- Session Controls -->
          @if (isAuthenticated()) {
            <div class="flex items-center gap-2">
              <div class="hidden lg:flex flex-col text-right pr-1">
                <span class="text-[9px] text-slate-400">Authenticated Session</span>
                <span class="text-xs font-bold text-slate-200 truncate max-w-[120px]" [title]="userEmail()">
                  {{ userEmail() }}
                </span>
              </div>
              <button 
                routerLink="/dashboard"
                class="bg-white/10 hover:bg-white/15 text-white p-2 sm:px-3 sm:py-2 rounded-xl transition-all border border-white/10 flex items-center gap-1 text-xs font-bold group"
              >
                <mat-icon class="!text-[16px] !w-[16px] !h-[16px] text-indigo-400">dashboard</mat-icon>
                <span class="hidden sm:inline">DASH_SYS</span>
              </button>
              <button 
                (click)="onLogout()"
                class="bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white p-2 sm:px-3 sm:py-2 rounded-xl transition-all border border-rose-500/20 hover:border-transparent flex items-center gap-1 text-xs font-bold group"
                title="Sign Out"
              >
                <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">logout</mat-icon>
                <span class="hidden sm:inline">OUT</span>
              </button>
            </div>
          } @else {
            <button 
              routerLink="/login"
              class="relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white px-5 h-10 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 text-xs tracking-wider uppercase"
            >
              <!-- Hover reflection -->
              <div class="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-[-25deg] -translate-x-full group-hover:animate-shine"></div>
              
              <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">lock_open</mat-icon>
              <span>LOCKPOINT LOGIN</span>
            </button>
          }
        </div>

      </div>

      <!-- Mobile Sub-Navigation Bar -->
      <div class="md:hidden flex items-center justify-around h-11 border-t border-white/5 bg-slate-950/40 px-2 overflow-x-auto gap-2">
        <a 
          routerLink="/home" 
          routerLinkActive="text-indigo-400 font-bold"
          class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold py-1 px-2 transition-all whitespace-nowrap"
        >
          Home
        </a>
        <a 
          routerLink="/marketplace" 
          routerLinkActive="text-indigo-400 font-bold"
          class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold py-1 px-2 transition-all whitespace-nowrap"
        >
          Matrix
        </a>
        <a 
          routerLink="/services" 
          routerLinkActive="text-indigo-400 font-bold"
          class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold py-1 px-2 transition-all whitespace-nowrap"
        >
          Services
        </a>
        <a 
          routerLink="/invoice-builder" 
          routerLinkActive="text-indigo-400 font-bold"
          class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold py-1 px-2 transition-all whitespace-nowrap"
        >
          Invoices
        </a>
        @if (isAuthenticated()) {
          <a 
            routerLink="/dashboard" 
            routerLinkActive="text-indigo-400 font-bold"
            class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold py-1 px-2 transition-all whitespace-nowrap"
          >
            Dashboard
          </a>
        }
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  userEmail = computed(() => this.authService.currentUser()?.email || 'Active Node');

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
  
  toggleTheme() {
    const current = this.themeService.currentTheme();
    let next: AppTheme = 'dark';
    if (current === 'dark') next = 'light';
    else if (current === 'light') next = 'neon';
    this.themeService.setTheme(next);
  }
}
