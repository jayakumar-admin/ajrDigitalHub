import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProjectData } from '../../../services/project-detail.service';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl space-y-6">
      <h2 class="text-2xl font-bold text-app-text tracking-tight flex items-center gap-2">
         <mat-icon class="text-indigo-500">grid_view</mat-icon> Smart Insights & Overview
      </h2>
      
      <!-- AI Insights -->
      <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 flex items-start gap-4">
         <div class="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <mat-icon class="text-indigo-400">auto_awesome</mat-icon>
         </div>
         <div>
            <h3 class="text-sm font-bold text-indigo-300">System Activity Insight</h3>
            <p class="text-sm text-indigo-200/80 mt-1">
               API traffic to <strong class="text-indigo-100">/api/checkout</strong> has increased by 35% in the last hour. 
               Database connection pools automatically scaled to accommodate load. No anomalies detected.
            </p>
         </div>
      </div>
 
      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <!-- Card 1: Status -->
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">Status</div>
            <div class="flex items-center gap-2 mt-2">
               <div class="w-2.5 h-2.5 rounded-full" [ngClass]="{'bg-emerald-400': project().status === 'live', 'bg-amber-400 animate-pulse': project().status === 'deploying', 'bg-rose-400': project().status === 'failed'}"></div>
               <span class="text-lg font-bold text-app-text uppercase">{{ project().status }}</span>
            </div>
            <div class="text-[10px] text-app-muted mt-2 font-mono flex items-center gap-1" *ngIf="project().firebase_config">
               <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Firebase: ACTIVE
            </div>
         </div>

         <!-- Card 2: Combined Traffic -->
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">Combined Traffic</div>
            <div class="text-lg font-bold text-indigo-400 mt-2 font-mono">{{ project().apiUsage | number }} Reqs</div>
            <div class="text-[10px] text-app-muted mt-2 font-mono" *ngIf="project().firebase_config && project().cached_metrics?.analytics">
               Firebase Users: {{ project().cached_metrics?.analytics?.activeUsers || 0 }} (Real-time)
            </div>
         </div>

         <!-- Card 3: Combined Errors -->
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">Combined Issues</div>
            <div class="text-lg font-mono font-bold text-rose-400 mt-2">{{ getLocalErrorCount() }} API Errors</div>
            <div class="text-[10px] text-app-muted mt-2 font-mono" *ngIf="project().firebase_config">
               Firebase Warnings: {{ getFirebaseWarningCount() }} (Live)
            </div>
         </div>

         <!-- Card 4: Domain URL -->
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">Routing Domain</div>
            <div class="text-xs font-mono text-emerald-400 truncate mt-2">{{ project().domain }}</div>
            <div class="text-[10px] text-indigo-400 truncate mt-2 font-mono" *ngIf="project().firebase_config">
               fb: {{ project().firebase_config?.projectId }}.web.app
            </div>
         </div>
      </div>
    </div>
  `
})
export class ProjectOverviewComponent {
  project = input.required<ProjectData>();

  getLocalErrorCount(): number {
     const logs = this.project().logs || [];
     return logs.filter(l => l.severity === 'Warning' || l.severity === 'Critical').length;
  }

  getFirebaseWarningCount(): number {
     if (this.project().cached_metrics?.status) {
        return this.project().cached_metrics?.status?.deploymentStatus === 'Success' ? 0 : 1;
     }
     return 0;
  }
}
