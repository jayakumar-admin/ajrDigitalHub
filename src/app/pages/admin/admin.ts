import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AdminMasterService, AdminApp } from '../../services/admin-master.service';
import { AdminStoreService } from '../../services/admin-store.service';
import { AjrAdminAppCard, AjrRateConfig } from './admin-components';
import { UiConfigService } from '../../services/ui-config.service';

@Component({
  selector: 'app-admin-master',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule, AjrAdminAppCard, AjrRateConfig],
  template: `
    <div class="min-h-screen bg-app-bg font-sans pb-20 fade-in">
      
      <!-- Top Global Header representing Master Control -->
      <header class="bg-app-card border-b border-app-border py-6 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <h1 class="text-3xl font-black text-app-text flex items-center gap-3">
                <mat-icon class="text-indigo-600 !w-[32px] !h-[32px] !text-[32px]">admin_panel_settings</mat-icon>
                Master Control Panel
             </h1>
             <p class="text-app-muted font-medium mt-1 pl-[44px]">Brain of the Digital HUB Platform.</p>
           </div>
           
           <!-- System Status Overview -->
           <div class="flex items-center gap-6 bg-app-bg border border-app-border rounded-2xl px-5 py-3">
              <div class="flex flex-col">
                 <span class="text-[10px] items-center gap-1.5 uppercase font-bold text-app-muted tracking-wider flex">
                    <mat-icon class="!w-[12px] !h-[12px] !text-[12px]">dns</mat-icon> Global Apps
                 </span>
                 <span class="text-xl font-black text-app-text">{{ adminService.apps().length }} Active</span>
              </div>
              <div class="w-px h-8 bg-app-border"></div>
              <div class="flex flex-col">
                 <span class="text-[10px] items-center gap-1.5 uppercase font-bold text-app-muted tracking-wider flex">
                    <mat-icon class="!w-[12px] !h-[12px] !text-[12px]">data_usage</mat-icon> 7D Requests
                 </span>
                 <span class="text-xl font-black text-indigo-600">{{ adminService.staticAnalytics().totalRequests | number }}</span>
              </div>
           </div>
        </div>
      </header>

      <!-- Main Layout -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8 relative">
        
        <!-- Left Sidebar Main Navigation for Admin -->
        <aside class="w-full md:w-64 shrink-0">
           <div class="bg-app-card border border-app-border rounded-2xl p-4 shadow-sm top-24 sticky">
             <div class="text-[10px] uppercase font-bold text-app-muted tracking-wider mb-3 px-3">System Control</div>
             <nav class="space-y-1">
               <button (click)="activeSection.set('applications')" [class]="activeSection() === 'applications' ? 'bg-indigo-50/20 text-indigo-500 font-bold' : 'text-app-text hover:bg-app-bg hover:text-indigo-400'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all text-left">
                  <span class="flex items-center gap-2"><mat-icon class="!w-[18px] !h-[18px] !text-[18px]">apps</mat-icon> Applications</span>
                  @if(adminService.apps().length > 0) {
                     <span class="bg-app-bg text-xs px-2 py-0.5 rounded shadow-sm border border-app-border">{{ adminService.apps().length }}</span>
                  }
               </button>
               <button (click)="activeSection.set('config')" [class]="activeSection() === 'config' ? 'bg-indigo-50/20 text-indigo-500 font-bold' : 'text-app-text hover:bg-app-bg hover:text-indigo-400'" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left">
                  <mat-icon class="!w-[18px] !h-[18px] !text-[18px]">settings</mat-icon> Global Config
               </button>
               <button (click)="activeSection.set('ratelimit')" [class]="activeSection() === 'ratelimit' ? 'bg-indigo-50/20 text-indigo-500 font-bold' : 'text-app-text hover:bg-app-bg hover:text-indigo-400'" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left">
                  <mat-icon class="!w-[18px] !h-[18px] !text-[18px]">security</mat-icon> Engine & Limits
               </button>
               <button (click)="activeSection.set('analytics')" [class]="activeSection() === 'analytics' ? 'bg-indigo-50/20 text-indigo-500 font-bold' : 'text-app-text hover:bg-app-bg hover:text-indigo-400'" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left">
                  <mat-icon class="!w-[18px] !h-[18px] !text-[18px]">insights</mat-icon> Telemetry
               </button>
               <button (click)="onSystemCoreClick()" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-cyan-600 hover:bg-cyan-500/10 transition-all text-left border border-dashed border-cyan-500/40 mt-2 shadow-xs">
                  <mat-icon class="!w-[18px] !h-[18px] !text-[18px] text-cyan-500 animate-pulse">dns</mat-icon> System Core Monitor ⭐
               </button>
               <button (click)="router.navigate(['/admin/marketplace-config'])" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-all text-left border border-dashed border-amber-500/40 mt-2 shadow-xs">
                  <mat-icon class="!w-[18px] !h-[18px] !text-[18px] text-amber-500">storefront</mat-icon> Marketplace Config ⭐
               </button>
             </nav>
             
             <div class="mt-6 pt-4 border-t border-app-border">
                <div class="bg-indigo-600 border border-indigo-500/30 text-app-text rounded-xl p-4 shadow-lg shadow-indigo-600/20 flex flex-col gap-1">
                   <div class="flex items-center gap-2 font-bold text-sm">
                      <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                      Control Core Active
                   </div>
                   <p class="text-[10px] text-indigo-100 font-mono select-all">SYSTEM_ONLINE</p>
                </div>
             </div>
           </div>
        </aside>

        <!-- Right Content Area -->
        <div class="flex-grow">
           
           <!-- Applications View -->
           @if (activeSection() === 'applications') {
              <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-app-text">Managed Applications</h2>
                    <button class="bg-indigo-600 text-app-text px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2">
                       <mat-icon class="!w-[18px] !h-[18px] !text-[18px]">add</mat-icon> Provision App
                    </button>
                 </div>

                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (app of adminService.apps(); track app.id) {
                       <ajr-admin-app-card [app]="app" (selectApp)="onAppClick($event)"></ajr-admin-app-card>
                    }
                 </div>
              </div>
           }

           <!-- Global Config View -->
           @if (activeSection() === 'config') {
              <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                 <h2 class="text-2xl font-bold text-app-text mb-6 flex items-center gap-2 text-indigo-600"><mat-icon>settings</mat-icon> Platform Configuration</h2>
                 
                 <div class="bg-app-card border border-app-border rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                       <label for="in-master-name" class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">Platform Master Name</label>
                       <input id="in-master-name" type="text" [ngModel]="adminService.websiteConfig().siteName" class="w-full px-4 py-3 bg-app-bg border border-app-border rounded-xl text-md font-semibold text-app-text outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    
                    <div>
                       <div class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">Platform Theme Engine</div>
                       <div class="flex flex-wrap gap-4">
                          <button id="btn-theme-light" (click)="uiConfig.themeService.setTheme('light')" class="flex-1 min-w-[120px] px-4 py-3 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer" [class.border-indigo-600]="uiConfig.themeService.currentTheme() === 'light'" [class.text-indigo-600]="uiConfig.themeService.currentTheme() === 'light'" [class.bg-indigo-50/10]="uiConfig.themeService.currentTheme() === 'light'" [class.border-app-border]="uiConfig.themeService.currentTheme() !== 'light'">
                             <mat-icon>light_mode</mat-icon> Light
                          </button>
                          <button id="btn-theme-dark" (click)="uiConfig.themeService.setTheme('dark')" class="flex-1 min-w-[120px] px-4 py-3 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer" [class.border-cyan-500]="uiConfig.themeService.currentTheme() === 'dark'" [class.text-cyan-400]="uiConfig.themeService.currentTheme() === 'dark'" [class.bg-app-bg]="uiConfig.themeService.currentTheme() === 'dark'" [class.border-app-border]="uiConfig.themeService.currentTheme() !== 'dark'">
                             <mat-icon>dark_mode</mat-icon> Dark
                          </button>
                          <button id="btn-theme-neon" (click)="uiConfig.themeService.setTheme('neon')" class="flex-1 min-w-[120px] px-4 py-3 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer" [class.text-[#3dff12]]="uiConfig.themeService.currentTheme() === 'neon'" [class.border-[#3dff12]]="uiConfig.themeService.currentTheme() === 'neon'" [class.bg-app-bg]="uiConfig.themeService.currentTheme() === 'neon'" [class.border-app-border]="uiConfig.themeService.currentTheme() !== 'neon'">
                             <mat-icon [class.text-[#3dff12]]="uiConfig.themeService.currentTheme() === 'neon'">bolt</mat-icon> Neon
                          </button>
                       </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-app-border">
                       <div>
                          <div class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">Animations (Motion)</div>
                          <button (click)="uiConfig.toggleAnimations()" [class]="uiConfig.animationsEnabled() ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-app-bg text-app-muted border-app-border'" class="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase border transition-all cursor-pointer">
                             <mat-icon>{{ uiConfig.animationsEnabled() ? 'blur_on' : 'blur_off' }}</mat-icon>
                             {{ uiConfig.animationsEnabled() ? 'ON (FLUID)' : 'OFF (STATIC)' }}
                          </button>
                       </div>
                       <div>
                          <div class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">Layout Density</div>
                          <div class="flex gap-2">
                             <button (click)="uiConfig.setDensity('comfortable')" [class]="uiConfig.layoutDensity() === 'comfortable' ? 'border-indigo-500 text-indigo-500 bg-indigo-500/10' : 'border-app-border text-app-text bg-transparent' " class="flex-1 py-2.5 rounded-xl text-xs flex justify-center border transition-all cursor-pointer font-bold">Comfortable</button>
                             <button (click)="uiConfig.setDensity('compact')" [class]="uiConfig.layoutDensity() === 'compact' ? 'border-indigo-500 text-indigo-500 bg-indigo-500/10' : 'border-app-border text-app-text bg-transparent' " class="flex-1 py-1.5 rounded-xl text-xs flex justify-center border transition-all cursor-pointer font-bold">Compact</button>
                          </div>
                       </div>
                    </div>

                    <div class="pt-6 border-t border-app-border">
                       <div class="flex items-center justify-between p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
                           <div>
                              <span class="text-sm font-bold text-rose-500 block">System Maintenance Mode</span>
                              <span class="text-xs text-rose-500/80 mt-0.5">Disconnects all public traffic. Admin only.</span>
                           </div>
                           <div class="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                              <input id="in-maint-mode" type="checkbox" [ngModel]="adminService.websiteConfig().globalFeatures.maintenanceMode" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-app-card border-4 appearance-none cursor-pointer border-rose-200 focus:outline-none top-0 left-0 transition-transform duration-200 ease-in-out"/>
                              <div class="toggle-label block overflow-hidden h-5 rounded-full bg-rose-200 cursor-pointer transition-colors duration-200 ease-in-out"></div>
                           </div>
                       </div>
                    </div>
                 </div>
              </div>
           }

           <!-- Rate Limit View -->
           @if (activeSection() === 'ratelimit') {
              <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl">
                 <ajr-rate-config [config]="adminService.rateLimiter()"></ajr-rate-config>
              </div>
           }

           <!-- Static Analytics View -->
           @if (activeSection() === 'analytics') {
              <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <h2 class="text-2xl font-bold text-app-text mb-6 flex items-center gap-2 text-indigo-600"><mat-icon>insights</mat-icon> Master Telemetry Insight</h2>
                 
                 <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div class="bg-app-card border border-app-border rounded-2xl p-6 shadow-sm">
                       <div class="text-xs uppercase font-bold text-app-muted tracking-wider mb-2">Total Edge Requests</div>
                       <div class="text-3xl font-black text-app-text">{{ adminService.staticAnalytics().totalRequests | number }}</div>
                    </div>
                    <div class="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 shadow-sm">
                       <div class="text-xs uppercase font-bold text-app-muted tracking-wider mb-2">Active Org Users</div>
                       <div class="text-3xl font-black text-emerald-600">{{ adminService.staticAnalytics().activeUsers | number }}</div>
                    </div>
                    <div class="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 shadow-sm">
                       <div class="text-xs uppercase font-bold text-app-muted tracking-wider mb-2">Failed Transmits</div>
                       <div class="text-3xl font-black text-rose-600">{{ adminService.staticAnalytics().errors | number }}</div>
                    </div>
                 </div>

                 <!-- Mock Chart Layout -->
                 <div class="bg-app-card border border-app-border rounded-2xl p-6 shadow-sm">
                    <h3 class="text-sm font-bold text-app-text mb-6">7-Day Edge Request Volume</h3>
                    <div class="h-64 flex items-end justify-between gap-2 px-2 border-b border-app-border pb-2">
                       @for (day of adminService.staticAnalytics().apiUsage; track day.date) {
                          <div class="flex-1 flex flex-col items-center gap-2 group">
                             <div class="w-full bg-indigo-500/20 rounded-t-lg transition-all group-hover:bg-indigo-600 relative flex items-end justify-center" [style.height.%]="(day.requests / 25000) * 100">
                                <span class="absolute -top-7 text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-app-card px-2 py-1 rounded shadow-sm border border-indigo-500/30">{{ day.requests }}</span>
                             </div>
                             <span class="text-xs font-bold text-app-muted">{{ day.date }}</span>
                          </div>
                       }
                    </div>
                 </div>
              </div>
           }

        </div>
      </main>

      <!-- Toast Notification rendered from Store Service -->
      @if (store.toast().visible) {
        <div id="toast-wrapper" class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 font-sans bg-app-card text-app-text border-app-border">
          <mat-icon class="!w-5 !h-5 !text-[20px] shrink-0" 
                    [class]="store.toast().type === 'success' ? 'text-emerald-500' : store.toast().type === 'error' ? 'text-rose-500' : 'text-amber-500'">
            {{ store.toast().type === 'success' ? 'check_circle' : store.toast().type === 'error' ? 'error' : 'info' }}
          </mat-icon>
          <span class="text-sm font-medium">{{ store.toast().message }}</span>
        </div>
      }
    </div>
  `
})
export class AdminComponent {
  adminService = inject(AdminMasterService);
  store = inject(AdminStoreService);
  router = inject(Router);
  uiConfig = inject(UiConfigService);
  
  activeSection = signal<'applications' | 'config' | 'ratelimit' | 'analytics'>('applications');

  onAppClick(app: AdminApp) {
    this.router.navigate(['/admin/apps', app.id]);
  }

  onSystemCoreClick() {
    this.router.navigate(['/admin/system-core']);
  }
}
