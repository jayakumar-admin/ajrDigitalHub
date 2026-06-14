import { Component, ChangeDetectionStrategy, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProjectData } from '../../../services/project-detail.service';
import { AdminCloudService } from '../../../services/admin-cloud.service';

@Component({
  selector: 'app-project-api-monitor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
      <h2 class="text-2xl font-bold text-app-text tracking-tight flex items-center gap-2">
         <mat-icon class="text-indigo-500">sensors</mat-icon> Analytics & Live Connection Stream
      </h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[600px]">
         
         <!-- Endpoint Analysis -->
         <div class="col-span-2 bg-app-bg border border-app-border rounded-xl flex flex-col overflow-hidden shadow-sm">
            <div class="p-4 border-b border-app-border bg-app-bg/80">
               <h3 class="text-xs font-bold text-app-text uppercase tracking-widest">Routing Analysis</h3>
            </div>
            <div class="flex-grow overflow-y-auto custom-scrollbar">
               <table class="w-full text-left">
                  <thead class="bg-app-bg sticky top-0 border-b border-app-border shadow-sm z-10">
                     <tr class="text-[9px] uppercase tracking-widest text-app-muted">
                        <th class="px-4 py-3">Route Endpoint</th>
                        <th class="px-4 py-3 text-right">Hits</th>
                        <th class="px-4 py-3 text-right">Latency</th>
                     </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/50">
                     @for (ep of cloudService.state().apiEndpoints; track ep.id) {
                        <tr class="hover:bg-app-card/30 transition-colors">
                           <td class="px-4 py-3 text-xs font-mono text-app-text">{{ ep.endpoint }}</td>
                           <td class="px-4 py-3 text-xs font-mono text-app-muted text-right">{{ ep.hits | number }}</td>
                           <td class="px-4 py-3 text-xs font-mono text-right flex items-center justify-end gap-2">
                              <span [ngClass]="{'text-amber-400': ep.status === 'Slow', 'text-app-muted': ep.status !== 'Slow'}">{{ ep.avg }}ms</span>
                           </td>
                        </tr>
                     }
                  </tbody>
               </table>
            </div>
         </div>

         <!-- Live Stream Console -->
         <div class="col-span-3 bg-app-bg border border-app-border rounded-xl flex flex-col overflow-hidden shadow-sm">
            <div class="p-4 border-b border-app-border flex items-center justify-between bg-app-bg">
               <div class="flex items-center gap-3">
                  <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse relative shadow-[0_0_10px_rgba(16,185,129,0.7)]"></div>
                  <h3 class="text-xs font-bold text-app-text font-mono tracking-wider uppercase">Live Connection Feed</h3>
               </div>
               <select (change)="updateFilter($any($event.target).value)" class="bg-app-bg border border-app-border text-xs text-app-muted rounded px-3 py-1.5 outline-none hover:border-slate-600 transition">
                  <option value="all">All Connections</option>
                  <option value="errors">Errors Only</option>
               </select>
            </div>
            <div class="p-5 flex-grow overflow-y-auto space-y-2 font-mono text-[12px] h-full custom-scrollbar" id="stream-console">
              @for (feed of filteredFeeds(); track feed.time) {
                <div [class]="feed.isError ? 'flex items-start gap-4 border border-rose-500/20 bg-rose-500/5 p-2 rounded -mx-1 mt-2 mb-2' : 'flex items-start gap-4 opacity-70 hover:bg-app-bg/50 p-1 -mx-1 rounded'">
                  <span [class]="feed.isError ? 'text-rose-500 w-16' : 'text-app-muted'">{{ feed.time }}</span>
                  <span [class]="feed.isError ? 'text-rose-400 font-bold w-10' : feed.method === 'GET' ? 'text-emerald-400 w-10' : 'text-indigo-400 w-10'">{{ feed.isError ? 'ERR' : feed.method }}</span>
                  <div class="flex-grow">
                      <span [class]="feed.isError ? 'text-rose-300' : 'text-app-muted'">{{ feed.endpoint }}</span>
                      @if (feed.isError) {
                        <div class="text-rose-400/80 mt-1">{{ feed.details }}</div>
                      }
                  </div>
                  @if (!feed.isError) {
                    <span class="text-emerald-500/70 ml-auto">{{ feed.status }} ({{ feed.duration }}ms)</span>
                  }
                </div>
              }
              <div class="text-app-muted animate-pulse mt-6 text-center italic">Waiting for events...</div>
            </div>
         </div>

      </div>
    </div>
  `
})
export class ProjectApiMonitorComponent {
  project = input.required<ProjectData>();
  cloudService = inject(AdminCloudService);
  streamFilter = signal<'all' | 'errors'>('all');

  feeds = [
    { time: '10:45:00', method: 'GET', endpoint: '/api/health', status: '200 OK', duration: 12, isError: false, details: '' },
    { time: '10:45:02', method: 'POST', endpoint: '/api/users', status: '201 Created', duration: 45, isError: false, details: '' },
    { time: '10:45:05', method: 'PUT', endpoint: '/api/config', status: '200 OK', duration: 120, isError: false, details: '' },
    { time: '10:45:10', method: 'GET', endpoint: '/api/checkout', status: '500 ERR', duration: 0, isError: true, details: '500 Internal Server Error • Rate limit exceeded (limit=100)' },
    { time: '10:45:12', method: 'GET', endpoint: '/api/products', status: '200 OK', duration: 22, isError: false, details: '' }
  ];

  updateFilter(val: 'all' | 'errors') {
    this.streamFilter.set(val);
  }

  filteredFeeds() {
    if (this.streamFilter() === 'errors') {
      return this.feeds.filter(f => f.isError);
    }
    return this.feeds;
  }
}
