import { Component, ChangeDetectionStrategy, input, output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProjectData } from '../../../services/project-detail.service';
import { AdminStoreService } from '../../../services/admin-store.service';
import { ButtonLoaderDirective } from '../../../shared/button-loader.directive';

@Component({
  selector: 'app-project-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIconModule, ButtonLoaderDirective],
  template: `
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-3xl space-y-6">
      <h2 class="text-2xl font-bold text-app-text flex items-center gap-2">
        <mat-icon class="text-indigo-400">settings</mat-icon> Core Configuration
      </h2>
      
      <div class="bg-app-bg border border-app-border rounded-xl p-6 space-y-6">
         <div>
            <label for="p-detail-name" class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">Application Name</label>
            <input id="p-detail-name" type="text" [(ngModel)]="model.name" class="w-full px-4 py-2.5 bg-app-bg border border-app-border rounded-lg text-sm text-app-text font-semibold focus:border-indigo-500/50 outline-none transition-all">
         </div>
         <div>
            <label for="p-detail-domain" class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-2">Routing Domain</label>
            <input id="p-detail-domain" type="text" [(ngModel)]="model.domain" class="w-full px-4 py-2.5 bg-app-bg border border-app-border rounded-lg text-sm text-emerald-400 focus:border-indigo-500/50 outline-none transition-all font-mono">
         </div>
         
         <div class="pt-6 border-t border-app-border">
            <div class="block text-xs font-bold uppercase tracking-wider text-app-muted mb-4">Feature Toggles</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <label for="chk-marketplace" class="flex items-center justify-between p-3 rounded-lg border border-app-border bg-app-bg hover:bg-app-card cursor-pointer transition">
                  <span class="text-sm font-semibold text-app-text">Marketplace Plugin</span>
                  <input id="chk-marketplace" type="checkbox" [(ngModel)]="model.features.marketplace" class="rounded bg-app-card border-slate-600 text-indigo-500 focus:ring-0 w-4 h-4 cursor-pointer">
               </label>
               <label for="chk-services" class="flex items-center justify-between p-3 rounded-lg border border-app-border bg-app-bg hover:bg-app-card cursor-pointer transition">
                  <span class="text-sm font-semibold text-app-text">Services Directory</span>
                  <input id="chk-services" type="checkbox" [(ngModel)]="model.features.services" class="rounded bg-app-card border-slate-600 text-indigo-500 focus:ring-0 w-4 h-4 cursor-pointer">
               </label>
            </div>
         </div>
      </div>
      
      <div class="mt-6 flex justify-end">
         <button (click)="onSave()" [appButtonLoader]="store.isLoading()" class="bg-indigo-500 hover:bg-indigo-400 text-app-text px-6 py-2 rounded-lg font-bold text-sm transition">
           Save Changes
         </button>
      </div>
    </div>
  `
})
export class ProjectConfigComponent implements OnInit {
  store = inject(AdminStoreService);
  project = input.required<ProjectData>();
  save = output<Partial<ProjectData>>();

  model!: {
    name: string;
    domain: string;
    features: {
      marketplace: boolean;
      services: boolean;
      analytics: boolean;
    }
  };

  ngOnInit() {
    const p = this.project();
    this.model = {
      name: p.name,
      domain: p.domain,
      features: {
        marketplace: p.features?.marketplace ?? true,
        services: p.features?.services ?? true,
        analytics: p.features?.analytics ?? true
      }
    };
  }

  onSave() {
    this.store.updateProject(this.project().id, this.model).subscribe();
    this.save.emit(this.model);
  }
}
