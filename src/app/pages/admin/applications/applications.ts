import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminStoreService } from '../../../services/admin-store.service';
import { AjrAdminAppCard } from '../admin-components';
import { AdminApp } from '../../../services/admin-master.service';
import { ButtonLoaderDirective } from '../../../shared/button-loader.directive';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule, AjrAdminAppCard, ButtonLoaderDirective],
  template: `
    <div class="space-y-6">
      
      <!-- Top Bar Title & Button -->
      <div class="flex justify-between items-center bg-app-card dark:bg-app-bg border border-app-border  p-6 rounded-2xl shadow-sm">
        <div>
          <h2 class="text-xl font-bold text-app-text ">Managed Applications</h2>
          <p class="text-xs text-app-muted mt-1">Ecosystem-wide deployment status and core credentials.</p>
        </div>
        <button id="btn-provision-modal" (click)="isModalOpen.set(true)" class="bg-indigo-600 hover:bg-indigo-500 text-app-text px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2">
          <mat-icon class="!w-[18px] !h-[18px] !text-[18px]">add</mat-icon> Provision App
        </button>
      </div>

      <!-- Apps Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (app of store.apps(); track app.id) {
          <ajr-admin-app-card [app]="app" (selectApp)="onAppSelected($event)"></ajr-admin-app-card>
        }
      </div>

      <!-- Add Project Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto font-sans flex items-center justify-center p-4 bg-app-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-app-card dark:bg-app-bg border border-app-border  rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 class="text-lg font-bold text-app-text  mb-4">Provision New Application</h3>
            
            <form (ngSubmit)="onFormSubmit()" class="space-y-4">
              <div>
                <label for="new-app-name" class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1">App Name</label>
                <input id="new-app-name" type="text" [(ngModel)]="newApp.name" name="name" required class="w-full px-4 py-2 bg-app-bg dark:bg-app-card border border-app-border  rounded-xl text-sm text-app-text  outline-none focus:ring-2 focus:ring-indigo-500">
              </div>

              <div>
                <label for="new-app-domain" class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1">Domain URL</label>
                <input id="new-app-domain" type="text" [(ngModel)]="newApp.domain" name="domain" required class="w-full px-4 py-2 bg-app-bg dark:bg-app-card border border-app-border  rounded-xl text-sm text-app-text  outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="new-app-env" class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1">Env</label>
                  <select id="new-app-env" [(ngModel)]="newApp.environment" name="environment" class="w-full px-4 py-2 bg-app-bg dark:bg-app-card border border-app-border  rounded-xl text-sm text-app-text  outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="Production">Production</option>
                    <option value="Staging">Staging</option>
                    <option value="Sandbox">Sandbox</option>
                  </select>
                </div>
                <div>
                  <label for="new-app-plan" class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-1">Plan</label>
                  <select id="new-app-plan" [(ngModel)]="newApp.plan" name="plan" class="w-full px-4 py-2 bg-app-bg dark:bg-app-card border border-app-border  rounded-xl text-sm text-app-text  outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="Lite">Lite</option>
                    <option value="Standard">Standard</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div class="pt-4 flex justify-end gap-3">
                <button type="button" (click)="isModalOpen.set(false)" class="px-4 py-2 border border-app-border  rounded-xl text-sm font-semibold text-app-muted dark:text-app-muted hover:bg-app-bg dark:hover:bg-app-card transition">
                  Cancel
                </button>
                <button id="btn-submit-app" type="submit" [disabled]="!newApp.name || !newApp.domain" [appButtonLoader]="store.isLoading()" class="px-5 py-2 bg-indigo-600 text-app-text rounded-xl text-sm font-bold hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Deploy Instance
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class ApplicationsListComponent {
  store = inject(AdminStoreService);
  appSelected = output<any>();
  isModalOpen = signal<boolean>(false);

  newApp = {
    name: '',
    domain: '',
    environment: 'Staging' as 'Production' | 'Staging' | 'Sandbox',
    plan: 'Standard' as 'Lite' | 'Standard' | 'Enterprise'
  };

  onAppSelected(app: AdminApp) {
    this.appSelected.emit(app);
  }

  onFormSubmit() {
    if (this.newApp.name && this.newApp.domain) {
      this.store.addProject({
        name: this.newApp.name,
        domain: this.newApp.domain,
        environment: this.newApp.environment,
        plan: this.newApp.plan,
        billing: {
          plan: this.newApp.plan,
          estimatedSpend: this.newApp.plan === 'Enterprise' ? 240.50 : this.newApp.plan === 'Standard' ? 45.00 : 15.00,
          currentSpend: 0,
          apiCalls: 0,
          apiLimit: this.newApp.plan === 'Enterprise' ? 1000000 : this.newApp.plan === 'Standard' ? 100000 : 10000,
          storageGb: 0,
          storageLimit: this.newApp.plan === 'Enterprise' ? 100 : this.newApp.plan === 'Standard' ? 10 : 2
        }
      });
      // Reset & close
      this.newApp = {
        name: '',
        domain: '',
        environment: 'Staging',
        plan: 'Standard'
      };
      this.isModalOpen.set(false);
    }
  }
}
