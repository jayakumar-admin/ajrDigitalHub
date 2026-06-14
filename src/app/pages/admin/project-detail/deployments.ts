import { Component, ChangeDetectionStrategy, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProjectData } from '../../../services/project-detail.service';
import { AdminCloudService } from '../../../services/admin-cloud.service';
import { AdminStoreService } from '../../../services/admin-store.service';

@Component({
  selector: 'app-project-deployments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl space-y-6">
      <div class="flex justify-between items-center bg-app-bg border border-app-border p-5 rounded-2xl">
         <div>
            <h2 class="text-2xl font-bold text-app-text flex items-center gap-2">
               <mat-icon class="text-indigo-400">cloud_upload</mat-icon> Artifact Deployment Pipeline
            </h2>
            <p class="text-xs text-app-muted mt-1">Continuous integration & real-time server cluster builds.</p>
         </div>
         <button (click)="triggerDeploy()" class="bg-indigo-600 hover:bg-indigo-500 text-app-text px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2">
            <mat-icon class="!w-4 !h-4 !text-[16px]">file_upload</mat-icon> Manual Deploy
         </button>
      </div>

      <div class="space-y-4">
         @for (dep of cloudService.state().deployments; track dep.id) {
            <div class="p-5 border border-app-border rounded-xl bg-app-bg flex items-center justify-between hover:bg-app-card/50 transition cursor-pointer shadow-sm relative overflow-hidden group">
               @if (dep.status === 'Deploying') {
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 animate-pulse"></div>
               } @else if (dep.status === 'Success') {
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
               } @else {
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 opacity-50"></div>
               }
               <div class="pl-2">
                  <div class="flex items-center gap-3 mb-1.5">
                     <span class="font-mono font-bold text-app-text text-lg tracking-tight">{{ dep.version }}</span>
                     <span class="text-xs bg-app-bg px-2.5 py-0.5 rounded text-app-muted border border-app-border tabular-nums">{{ dep.time | date:'MMM d, h:mm a' }}</span>
                  </div>
                  <div class="text-xs text-app-muted mt-1">Source: Main branch • Commit <span class="font-mono text-app-muted bg-app-bg px-1 rounded border border-app-border">8f3a2c</span></div>
                  @if (dep.status === 'Deploying') {
                     <div class="mt-4">
                        <div class="w-64 h-1.5 bg-app-bg rounded-full overflow-hidden border border-app-border shadow-inner">
                           <div class="h-full bg-indigo-500 animate-pulse transition-all" [style.width.%]="dep.progress"></div>
                        </div>
                     </div>
                  }
               </div>
               <div class="flex items-center gap-3">
                  <span class="text-[10px] uppercase font-bold tracking-widest mr-4"
                        [ngClass]="{
                          'text-emerald-400': dep.status === 'Success',
                          'text-amber-400': dep.status === 'Deploying',
                          'text-rose-400': dep.status === 'Failed'
                        }">{{ dep.status }}</span>
                  <button (click)="viewLogs(dep)" class="px-3 py-1.5 bg-app-bg border border-app-border text-app-text rounded text-xs font-bold hover:bg-app-card transition shadow-sm">View Logs</button>
               </div>
            </div>
         }
      </div>

      <!-- Realtime Log Terminal -->
      @if (currentLogs()) {
        <div class="bg-black/90 border border-app-border rounded-xl p-5 shadow-lg space-y-3 font-mono text-xs text-app-text animate-in slide-in-from-bottom duration-250">
          <div class="flex items-center justify-between border-b border-app-border pb-2.5">
            <span class="font-bold flex items-center gap-2"><div class="w-2 h-2 rounded-full bg-indigo-500"></div> logs: {{ currentLogsVersion() }}</span>
            <button (click)="currentLogs.set('')" class="text-app-muted hover:text-app-text transition"><mat-icon class="!w-4 !h-4 !text-[16px]">close</mat-icon></button>
          </div>
          <div class="h-40 overflow-y-auto space-y-1.5 custom-scrollbar bg-app-bg p-3 rounded border border-app-border leading-relaxed tabular-nums">
             <span class="text-app-muted">14:02:10 [CI] Build container initiated. Target platform: Cloud Run.</span><br>
             <span class="text-app-muted">14:02:12 [CI] Running npm compile-applet... verified.</span><br>
             <span class="text-indigo-400">14:02:15 [System] Dependency security validation complete. 0 vulnerabilities.</span><br>
             <span class="text-emerald-400">14:02:18 [Deploy] Deploying artifact revision... 100% active state achieved.</span><br>
             <span class="text-app-muted">14:02:20 [Router] Rerouted domain records to active version.</span>
          </div>
        </div>
      }
    </div>
  `
})
export class ProjectDeploymentsComponent {
  project = input.required<ProjectData>();
  cloudService = inject(AdminCloudService);
  store = inject(AdminStoreService);

  currentLogs = signal('');
  currentLogsVersion = signal('');

  triggerDeploy() {
    this.store.showToast('Initiating visual pipeline build trigger...', 'info');
    setTimeout(() => {
      this.store.showToast('Project build artifact compilation success, deploy live!', 'success');
    }, 1500);
  }

  viewLogs(dep: any) {
    this.currentLogsVersion.set(dep.version);
    this.currentLogs.set('active');
  }
}
