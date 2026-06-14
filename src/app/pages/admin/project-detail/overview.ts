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
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">Status</div>
            <div class="flex items-center gap-2 mt-2">
               <div class="w-2.5 h-2.5 rounded-full" [ngClass]="{'bg-emerald-400': project().status === 'live', 'bg-amber-400 animate-pulse': project().status === 'deploying', 'bg-rose-400': project().status === 'failed'}"></div>
               <span class="text-lg font-bold text-app-text uppercase">{{ project().status }}</span>
            </div>
         </div>
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">Assigned Plan</div>
            <div class="text-lg font-bold text-indigo-400 mt-2">{{ project().plan }} Compute</div>
         </div>
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">API Usage (7D)</div>
            <div class="text-lg font-mono font-bold text-app-text mt-2">{{ project().apiUsage | number }} reqs</div>
         </div>
         <div class="bg-app-bg border border-app-border rounded-xl p-5 shadow-sm">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-1">Routing Domain</div>
            <div class="text-sm font-mono text-emerald-400 truncate mt-2">{{ project().domain }}</div>
         </div>
      </div>
    </div>
  `
})
export class ProjectOverviewComponent {
  project = input.required<ProjectData>();
}
