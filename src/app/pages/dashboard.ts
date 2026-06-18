import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      <!-- Side Navigation Rail -->
      <aside class="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col transition-all shrink-0">
        <!-- Logo Header -->
        <div class="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <mat-icon class="text-xl h-5 w-5 leading-none">dynamic_form</mat-icon>
          </div>
          <div>
            <h1 class="text-sm font-semibold tracking-tight text-slate-800">FormBuilder SaaS</h1>
            <span class="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider">Suite v1.0</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1">
          <a 
            routerLink="/dashboard/forms" 
            routerLinkActive="bg-indigo-50 text-indigo-700"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group cursor-pointer"
          >
            <mat-icon class="text-slate-400 group-hover:text-slate-500">list_alt</mat-icon>
            <span>My Dynamic Forms</span>
          </a>
        </nav>

        <!-- Current User Footer Card -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl">
          <div class="flex items-center gap-3 mb-2">
            <div class="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {{ authService.currentUser()?.email?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div class="truncate max-w-[140px]">
              <p class="text-xs font-semibold text-slate-800 truncate">{{ authService.currentUser()?.email }}</p>
              <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                {{ authService.currentUser()?.role || 'user' }}
              </span>
            </div>
          </div>
          <button 
            id="btn-sidebar-logout"
            (click)="onLogout()"
            class="w-full flex items-center justify-center gap-2 mt-2 py-2 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
          >
            <mat-icon class="text-sm">logout</mat-icon>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Workspace Panel -->
      <div class="flex-1 flex flex-col min-w-0">
        
        <!-- Top Sticky Header -->
        <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-8 z-10 shrink-0">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              ● Live Sandbox
            </span>
          </div>

          <div class="flex items-center gap-4">
            <div class="hidden sm:flex flex-col text-right">
              <span class="text-xs font-medium text-slate-500">Workspace Owner</span>
              <span class="text-sm font-semibold text-slate-900">{{ authService.currentUser()?.email }}</span>
            </div>
          </div>
        </header>

        <!-- Content Shell -->
        <main class="flex-1 overflow-y-auto p-6 md:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `
})
export class Dashboard {
  authService = inject(AuthService);
  private router = inject(Router);

  onLogout() {
    this.authService.logout();
  }
}
