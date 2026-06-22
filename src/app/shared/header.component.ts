import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
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
    <header class="glass sticky top-0 z-[40] w-full backdrop-blur-md select-none border-t-0 border-x-0 border-b border-app-border transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <!-- Logo Branding -->
        <a routerLink="/" class="flex items-center gap-2.5 group cursor-pointer focus:outline-none">
          <img src="/logo.png" alt="AJR Digital Hub Logo" class="h-10 w-10 object-contain group-hover:scale-105 transition-all drop-shadow-md" />
          <div class="flex flex-col">
            <span class="text-sm font-black text-app-text uppercase tracking-wider font-display">AJR Digital Hub</span>
            <span class="text-[9px] font-mono text-secondary font-bold uppercase tracking-widest leading-none">Enterprise Cluster</span>
          </div>
        </a>

        <!-- Main Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1.5 bg-app-bg/50 p-1 rounded-xl border border-app-border">
          <a 
            routerLink="/home" 
            routerLinkActive="bg-app-card text-app-text font-bold shadow-sm"
            class="px-4 py-2 text-xs font-semibold text-app-muted hover:text-app-text rounded-lg transition-all"
          >
            Home
          </a>
          <a 
            routerLink="/marketplace" 
            routerLinkActive="bg-app-card text-app-text font-bold shadow-sm"
            class="px-4 py-2 text-xs font-semibold text-app-muted hover:text-app-text rounded-lg transition-all"
          >
            Asset Matrix
          </a>
          <a 
            routerLink="/services" 
            routerLinkActive="bg-app-card text-app-text font-bold shadow-sm"
            class="px-4 py-2 text-xs font-semibold text-app-muted hover:text-app-text rounded-lg transition-all"
          >
            Core Services
          </a>
          <a 
            routerLink="/invoice-builder" 
            routerLinkActive="bg-app-card text-app-text font-bold shadow-sm"
            class="px-4 py-2 text-xs font-semibold text-app-muted hover:text-app-text rounded-lg transition-all"
          >
            Invoice Builder
          </a>
          @if (isAuthenticated()) {
            <a 
              routerLink="/dashboard" 
              routerLinkActive="bg-app-card text-app-text font-bold shadow-sm"
              class="px-4 py-2 text-xs font-semibold text-app-muted hover:text-app-text rounded-lg transition-all"
            >
              Dashboard
            </a>
          }
        </nav>

        <!-- Right Side: Auth / Actions -->
        <div class="flex items-center gap-3">
          <!-- Active cluster indicator -->
          <div class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            Node Online
          </div>

          <!-- Divider -->
          <span class="hidden sm:block h-5 w-px bg-app-border"></span>
          
          <!-- Theme Toggle -->
          <button (click)="toggleTheme()" class="text-app-muted hover:text-app-text bg-app-card/50 hover:bg-app-card p-2 rounded-xl transition-all border border-app-border flex items-center justify-center cursor-pointer" [title]="'Current Theme: ' + themeService.currentTheme()">
            <mat-icon *ngIf="themeService.currentTheme() === 'dark'" class="!text-[20px] !w-[20px] !h-[20px]">dark_mode</mat-icon>
            <mat-icon *ngIf="themeService.currentTheme() === 'light'" class="!text-[20px] !w-[20px] !h-[20px]">light_mode</mat-icon>
            <mat-icon *ngIf="themeService.currentTheme() === 'neon'" class="!text-[20px] !w-[20px] !h-[20px] text-pink-500">flare</mat-icon>
          </button>

          <!-- Session Controls -->
          @if (isAuthenticated()) {
            <div class="flex items-center gap-2">
              <div class="hidden lg:flex flex-col text-right pr-1">
                <span class="text-[9px] text-app-muted">Authenticated Session</span>
                <span class="text-xs font-bold text-app-text truncate max-w-[120px]" [title]="userEmail()">
                  {{ userEmail() }}
                </span>
              </div>
              <button 
                routerLink="/dashboard"
                class="bg-app-card hover:bg-app-bg text-app-text p-2 sm:px-3 sm:py-2 rounded-xl transition-all border border-app-border flex items-center gap-1 text-xs font-bold group cursor-pointer"
              >
                <mat-icon class="!text-[16px] !w-[16px] !h-[16px] text-secondary">dashboard</mat-icon>
                <span class="hidden sm:inline">DASH_SYS</span>
              </button>
              <button 
                (click)="onLogout()"
                class="bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white p-2 sm:px-3 sm:py-2 rounded-xl transition-all border border-rose-500/20 hover:border-transparent flex items-center gap-1 text-xs font-bold group cursor-pointer"
                title="Sign Out"
              >
                <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">logout</mat-icon>
                <span class="hidden sm:inline">OUT</span>
              </button>
            </div>
          } @else {
            <button 
              routerLink="/login"
              class="relative group overflow-hidden bg-primary hover:bg-accent text-white px-5 h-10 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-xs tracking-wider uppercase cursor-pointer"
            >
              <!-- Hover reflection -->
              <div class="absolute inset-0 w-1/2 h-full bg-white/15 skew-x-[-25deg] -translate-x-full group-hover:animate-shine"></div>
              
              <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">lock_open</mat-icon>
              <span>LOCKPOINT LOGIN</span>
            </button>
          }

          <!-- Mobile Hamburger Trigger Button (Three lines) -->
          <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" class="md:hidden text-app-muted hover:text-app-text bg-app-card/50 hover:bg-app-card p-2 rounded-xl transition-all border border-app-border flex items-center justify-center cursor-pointer animate-in duration-200" aria-label="Toggle Navigation">
            <mat-icon class="!text-[20px] !w-[20px] !h-[20px]">{{ isMobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>

      </div>

      <!-- Mobile Floating Menu Dropdown Overlay -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden absolute left-4 right-4 mt-1 bg-app-card border border-app-border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div class="flex flex-col gap-1">
            <a 
              routerLink="/home" 
              routerLinkActive="bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 shadow-sm"
              [routerLinkActiveOptions]="{exact: true}"
              (click)="isMobileMenuOpen.set(false)"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-app-text hover:text-indigo-400 transition-all text-left"
            >
              <mat-icon class="!w-[16px] !h-[16px] !text-[16px]">home</mat-icon>
              Home
            </a>
            <a 
              routerLink="/marketplace" 
              routerLinkActive="bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 shadow-sm"
              (click)="isMobileMenuOpen.set(false)"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-app-text hover:text-indigo-400 transition-all text-left"
            >
              <mat-icon class="!w-[16px] !h-[16px] !text-[16px]">grid_view</mat-icon>
              Asset Matrix
            </a>
            <a 
              routerLink="/services" 
              routerLinkActive="bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 shadow-sm"
              (click)="isMobileMenuOpen.set(false)"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-app-text hover:text-indigo-400 transition-all text-left"
            >
              <mat-icon class="!w-[16px] !h-[16px] !text-[16px]">cloud_done</mat-icon>
              Core Services
            </a>
            <a 
              routerLink="/invoice-builder" 
              routerLinkActive="bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 shadow-sm"
              (click)="isMobileMenuOpen.set(false)"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-app-text hover:text-indigo-400 transition-all text-left"
            >
              <mat-icon class="!w-[16px] !h-[16px] !text-[16px]">receipt_long</mat-icon>
              Invoice Builder
            </a>
            @if (isAuthenticated()) {
              <a 
                routerLink="/dashboard" 
                routerLinkActive="bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 shadow-sm"
                (click)="isMobileMenuOpen.set(false)"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-app-text hover:text-indigo-400 transition-all text-left"
              >
                <mat-icon class="!w-[16px] !h-[16px] !text-[16px]">dashboard</mat-icon>
                Dashboard
              </a>
            }
          </div>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  isAuthenticated = computed(() => this.authService.isAuthenticated());
  userEmail = computed(() => this.authService.currentUser()?.email || 'Active Node');
  isMobileMenuOpen = signal(false);

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
