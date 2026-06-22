import {
  Component, ChangeDetectionStrategy, input, inject, signal,
  OnInit, OnDestroy, ChangeDetectorRef, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjectData } from '../../../services/project-detail.service';
import {
  WhatsappBillingService,
  WaBillingSummary, WaTemplateStat, WaGraphData, WaTemplateDetail
} from '../../../services/whatsapp-billing.service';

// ────────────────────────────────────────────────────────────────────────────
//  WhatsApp Billing Component
// ────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-whatsapp-billing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
<div class="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10 max-w-[1300px] space-y-6">

  <!-- ── HEADER ─────────────────────────────────────────────────────────── -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div class="flex items-center gap-3 mb-1">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center"
             style="background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);">
          <mat-icon class="text-white !text-[20px] !w-5 !h-5">chat</mat-icon>
        </div>
        <h2 class="text-2xl font-black text-app-text tracking-tight">WhatsApp Billing & Analytics</h2>
        <!-- Live indicator -->
        <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style="background:rgba(37,211,102,0.12); border:1px solid rgba(37,211,102,0.3); color:#25d366;">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:#25d366;"></span>
          LIVE
        </span>
      </div>
      <p class="text-xs text-app-muted ml-12">Realtime analytics from Meta Graph API + Firebase • Auto-refresh every 5s</p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <button (click)="refreshAll()"
              [disabled]="isLoading()"
              id="wa-refresh-btn"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all"
              style="background:rgba(37,211,102,0.08); border-color:rgba(37,211,102,0.25); color:#25d366;"
              [class.opacity-50]="isLoading()">
        <mat-icon class="!text-[15px] !w-[15px] !h-[15px]" [class.animate-spin]="isLoading()">refresh</mat-icon>
        {{ isLoading() ? 'Refreshing…' : 'Refresh' }}
      </button>
      <button (click)="exportCSV()"
              [disabled]="!templates() || templates().length === 0"
              id="wa-export-csv-btn"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-app-card border border-app-border text-app-text hover:bg-app-bg transition-all">
        <mat-icon class="!text-[15px] !w-[15px] !h-[15px]">download</mat-icon>
        Export CSV
      </button>
    </div>
  </div>

  <!-- ── HIGH COST ALERT ─────────────────────────────────────────────────── -->
  @if (summary() && (summary()!.estimatedCost > costAlertThreshold)) {
    <div class="rounded-xl p-4 flex items-start gap-3 animate-in fade-in duration-300"
         style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2);">
      <mat-icon class="text-rose-400 shrink-0 !text-[22px]">warning_amber</mat-icon>
      <div>
        <div class="text-xs font-bold text-rose-400 uppercase tracking-wider mb-0.5">High Cost Alert</div>
        <div class="text-sm text-app-text">
          Current 1-hour spend of
          <span class="font-bold text-rose-300">₹{{ summary()!.estimatedCost | number:'1.2-2' }}</span>
          exceeds threshold. Projected monthly: <span class="font-bold text-rose-300">₹{{ summary()!.monthlyEstimate | number:'1.2-2' }}</span>.
        </div>
      </div>
    </div>
  }

  <!-- ── SUMMARY CARDS ───────────────────────────────────────────────────── -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

    <!-- Messages Sent -->
    <div class="relative rounded-xl p-3.5 sm:p-5 overflow-hidden border transition-all hover:scale-[1.02] duration-200"
         style="background:linear-gradient(135deg,#0f172a 60%,rgba(37,211,102,0.08)); border-color:rgba(37,211,102,0.2);">
      <div class="absolute -right-3 -top-3 opacity-[0.07]">
        <mat-icon class="!text-[60px] md:!text-[80px] !w-16 md:!w-20 !h-16 md:!h-20 text-green-400">send</mat-icon>
      </div>
      <div class="text-[9px] md:text-[10px] font-bold text-app-muted uppercase tracking-widest mb-1.5">Messages Sent</div>
      @if (isLoading() && !summary()) {
        <div class="h-6 md:h-8 w-16 md:w-20 rounded bg-app-card animate-pulse mb-2"></div>
      } @else {
        <div class="text-xl sm:text-2xl md:text-3xl font-black text-app-text font-mono tabular-nums truncate">
          {{ (summary()?.messagesSent || 0) | number }}
        </div>
      }
      <div class="text-[9px] md:text-[10px] text-app-muted mt-1.5">Last 1 hour</div>
      <div class="mt-2.5 h-1 rounded-full overflow-hidden bg-app-bg/50">
        <div class="h-full rounded-full transition-all duration-700"
             style="background:#25d366;"
             [style.width.%]="summary() ? 100 : 0"></div>
      </div>
    </div>

    <!-- Delivered -->
    <div class="relative rounded-xl p-3.5 sm:p-5 overflow-hidden border transition-all hover:scale-[1.02] duration-200"
         style="background:linear-gradient(135deg,#0f172a 60%,rgba(99,102,241,0.08)); border-color:rgba(99,102,241,0.2);">
      <div class="absolute -right-3 -top-3 opacity-[0.07]">
        <mat-icon class="!text-[60px] md:!text-[80px] !w-16 md:!w-20 !h-16 md:!h-20 text-indigo-400">done_all</mat-icon>
      </div>
      <div class="text-[9px] md:text-[10px] font-bold text-app-muted uppercase tracking-widest mb-1.5">Delivered</div>
      @if (isLoading() && !summary()) {
        <div class="h-6 md:h-8 w-16 md:w-20 rounded bg-app-card animate-pulse mb-2"></div>
      } @else {
        <div class="text-xl sm:text-2xl md:text-3xl font-black text-app-text font-mono tabular-nums truncate">
          {{ (summary()?.messagesDelivered || 0) | number }}
        </div>
      }
      <div class="text-[9px] md:text-[10px] font-bold mt-1.5 truncate" style="color:#818cf8;">
        {{ summary()?.deliveryRate || 0 }}% rate
      </div>
      <div class="mt-2.5 h-1 rounded-full overflow-hidden bg-app-bg/50">
        <div class="h-full rounded-full transition-all duration-700"
             style="background:#818cf8;"
             [style.width.%]="summary()?.deliveryRate || 0"></div>
      </div>
    </div>

    <!-- Read Rate -->
    <div class="relative rounded-xl p-3.5 sm:p-5 overflow-hidden border transition-all hover:scale-[1.02] duration-200"
         style="background:linear-gradient(135deg,#0f172a 60%,rgba(251,191,36,0.08)); border-color:rgba(251,191,36,0.2);">
      <div class="absolute -right-3 -top-3 opacity-[0.07]">
        <mat-icon class="!text-[60px] md:!text-[80px] !w-16 md:!w-20 !h-16 md:!h-20 text-amber-400">mark_email_read</mat-icon>
      </div>
      <div class="text-[9px] md:text-[10px] font-bold text-app-muted uppercase tracking-widest mb-1.5">Read Rate</div>
      @if (isLoading() && !summary()) {
        <div class="h-6 md:h-8 w-16 md:w-20 rounded bg-app-card animate-pulse mb-2"></div>
      } @else {
        <!-- Circular progress -->
        <div class="flex items-center gap-2 md:gap-3">
          <div class="relative w-9 h-9 md:w-12 md:h-12 shrink-0">
            <svg class="w-9 h-9 md:w-12 md:h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(251,191,36,0.15)" stroke-width="2.5"/>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fbbf24" stroke-width="2.5"
                      stroke-dasharray="100" [attr.stroke-dashoffset]="100 - (summary()?.readRate || 0)"
                      stroke-linecap="round" style="transition: stroke-dashoffset 0.7s ease;"/>
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-[8px] md:text-[10px] font-black text-amber-400">
              {{ summary()?.readRate || 0 }}%
            </span>
          </div>
          <div class="text-xl sm:text-2xl md:text-3xl font-black text-app-text font-mono tabular-nums truncate">
            {{ (summary()?.messagesRead || 0) | number }}
          </div>
        </div>
      }
      <div class="text-[9px] md:text-[10px] text-app-muted mt-1.5">Messages opened</div>
    </div>

    <!-- Estimated Cost -->
    <div class="relative rounded-xl p-3.5 sm:p-5 overflow-hidden border transition-all hover:scale-[1.02] duration-200"
         style="background:linear-gradient(135deg,#0f172a 60%,rgba(245,158,11,0.08)); border-color:rgba(245,158,11,0.2);">
      <div class="absolute -right-3 -top-3 opacity-[0.07]">
        <mat-icon class="!text-[60px] md:!text-[80px] !w-16 md:!w-20 !h-16 md:!h-20 text-orange-400">currency_rupee</mat-icon>
      </div>
      <div class="text-[9px] md:text-[10px] font-bold text-app-muted uppercase tracking-widest mb-1.5">Est. Cost (1hr)</div>
      @if (isLoading() && !summary()) {
        <div class="h-6 md:h-8 w-20 md:w-24 rounded bg-app-card animate-pulse mb-2"></div>
      } @else {
        <div class="text-xl sm:text-2xl md:text-3xl font-black font-mono tabular-nums truncate" style="color:#f59e0b;">
          ₹{{ (summary()?.estimatedCost || 0) | number:'1.2-2' }}
        </div>
      }
      <div class="text-[9px] md:text-[10px] text-app-muted mt-1.5 truncate">
        ~₹{{ (summary()?.monthlyEstimate || 0) | number:'1.0-0' }} proj.
      </div>
      <div class="mt-2.5 h-1 rounded-full overflow-hidden bg-app-bg/50">
        <div class="h-full rounded-full transition-all duration-700"
             style="background:#f59e0b;"
             [style.width.%]="Math.min(((summary()?.estimatedCost || 0) / (costAlertThreshold || 1)) * 100, 100)"></div>
      </div>
    </div>
  </div>

  <!-- ── AI INSIGHTS ROW ─────────────────────────────────────────────────── -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- AI Cost Prediction -->
    <div class="rounded-xl p-4 flex items-start gap-3"
         style="background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.2);">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
           style="background:rgba(99,102,241,0.15);">
        <mat-icon class="!text-[16px] !w-4 !h-4 text-indigo-400">auto_awesome</mat-icon>
      </div>
      <div>
        <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">AI Cost Prediction (8hr peak)</div>
        <div class="text-xl font-black text-app-text">₹{{ (summary()?.aiCostPrediction || 0) | number:'1.2-2' }}</div>
        <div class="text-[10px] text-app-muted mt-1">Based on current hourly rate × 8hr peak factor</div>
      </div>
    </div>

    <!-- Top Performing Template -->
    <div class="rounded-xl p-4 flex items-start gap-3"
         style="background:rgba(37,211,102,0.06); border:1px solid rgba(37,211,102,0.2);">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
           style="background:rgba(37,211,102,0.15);">
        <mat-icon class="!text-[16px] !w-4 !h-4" style="color:#25d366;">emoji_events</mat-icon>
      </div>
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wider mb-1" style="color:#25d366;">Top Template</div>
        @if (topTemplate()) {
          <div class="text-sm font-bold text-app-text font-mono">{{ topTemplate()!.templateName }}</div>
          <div class="text-[10px] text-app-muted mt-1">
            {{ topTemplate()!.sent + topTemplate()!.delivered + topTemplate()!.read | number }} msgs •
            {{ topTemplate()!.readRate }}% read rate
          </div>
        } @else {
          <div class="text-sm text-app-muted">No data yet</div>
        }
      </div>
    </div>

    <!-- Monthly Billing Estimate -->
    <div class="rounded-xl p-4 flex items-start gap-3"
         style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2);">
      <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
           style="background:rgba(245,158,11,0.15);">
        <mat-icon class="!text-[16px] !w-4 !h-4 text-amber-400">calendar_month</mat-icon>
      </div>
      <div>
        <div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Monthly Estimate</div>
        <div class="text-xl font-black text-app-text">₹{{ (summary()?.monthlyEstimate || 0) | number:'1.0-0' }}</div>
        <div class="text-[10px] text-app-muted mt-1">Projected from current 1hr rate × 720</div>
      </div>
    </div>
  </div>

  <!-- ── REALTIME GRAPH ──────────────────────────────────────────────────── -->
  <div class="rounded-2xl border overflow-hidden" style="background:#0f172a; border-color:rgba(255,255,255,0.08);">
    <div class="px-6 py-4 border-b flex items-center justify-between" style="border-color:rgba(255,255,255,0.07);">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full animate-pulse" style="background:#25d366;"></div>
        <h3 class="text-sm font-bold text-app-text">Messages vs Time (Last 1 Hour)</h3>
      </div>
      <div class="flex items-center gap-4 text-[10px] font-semibold">
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full inline-block" style="background:#25d366;"></span>Sent</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full inline-block" style="background:#818cf8;"></span>Delivered</span>
        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full inline-block" style="background:#fbbf24;"></span>Read</span>
        <span class="flex items-center gap-1.5 text-app-muted" style="color:#f97316;">
          <span class="w-2 h-2 rounded-full inline-block" style="background:#f97316;"></span>Cost (₹)
        </span>
      </div>
    </div>

    <div class="p-6">
      @if (graph()) {
        <!-- SVG Chart -->
        <div class="relative h-48 w-full">
          <svg class="w-full h-full" [attr.viewBox]="'0 0 ' + chartWidth + ' 160'" preserveAspectRatio="none">
            <!-- Grid lines -->
            @for (line of [0,1,2,3]; track line) {
              <line [attr.x1]="0" [attr.y1]="line * 40" [attr.x2]="chartWidth" [attr.y2]="line * 40"
                    stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
            }

            <!-- Sent line -->
            <polyline [attr.points]="buildPolylinePoints(graph()!.sent)"
                      fill="none" stroke="#25d366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      style="filter:drop-shadow(0 0 4px rgba(37,211,102,0.5));"/>

            <!-- Delivered line -->
            <polyline [attr.points]="buildPolylinePoints(graph()!.delivered)"
                      fill="none" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      style="filter:drop-shadow(0 0 4px rgba(129,140,248,0.5));"/>

            <!-- Read line -->
            <polyline [attr.points]="buildPolylinePoints(graph()!.read)"
                      fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                      style="filter:drop-shadow(0 0 4px rgba(251,191,36,0.5));"/>
          </svg>

          <!-- X-axis labels -->
          <div class="flex justify-between mt-2">
            @for (label of graph()!.labels; track $index) {
              @if ($index % 3 === 0 || $index === graph()!.labels.length - 1) {
                <span class="text-[9px] text-app-muted font-mono">{{ label }}</span>
              } @else {
                <span class="text-[9px] opacity-0">{{ label }}</span>
              }
            }
          </div>
        </div>
      } @else {
        <!-- Skeleton graph -->
        <div class="h-48 flex flex-col gap-2 justify-end">
          @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
            <div class="flex-1 rounded bg-app-card/40 animate-pulse"></div>
          }
        </div>
      }
    </div>
  </div>

  <!-- ── TEMPLATES TABLE ────────────────────────────────────────────────── -->
  <div class="rounded-2xl border overflow-hidden" style="background:#0f172a; border-color:rgba(255,255,255,0.08);">
    <div class="px-6 py-4 border-b flex items-center justify-between" style="border-color:rgba(255,255,255,0.07);">
      <div class="flex items-center gap-3">
        <mat-icon class="!text-[18px] !w-[18px] !h-[18px]" style="color:#25d366;">table_chart</mat-icon>
        <h3 class="text-sm font-bold text-app-text">Template Performance — Realtime</h3>
        @if (templates().length > 0) {
          <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                style="background:rgba(37,211,102,0.12); color:#25d366; border:1px solid rgba(37,211,102,0.25);">
            {{ templates().length }} templates
          </span>
        }
      </div>
      <!-- Search filter -->
      <div class="relative">
        <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-[14px] !w-[14px] !h-[14px] text-app-muted">search</mat-icon>
        <input [(ngModel)]="templateSearch" id="wa-template-search"
               placeholder="Filter templates…"
               class="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-app-bg border border-app-border text-app-text outline-none focus:border-indigo-500/50 transition w-44">
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-[10px] uppercase tracking-widest text-app-muted border-b" style="border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.02);">
            <th class="px-5 py-3 font-semibold">Template</th>
            <th class="px-4 py-3 font-semibold">Category</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold text-right">Sent</th>
            <th class="px-4 py-3 font-semibold text-right">Delivered</th>
            <th class="px-4 py-3 font-semibold text-right">Read %</th>
            <th class="px-4 py-3 font-semibold text-right">Cost</th>
            <th class="px-4 py-3 font-semibold text-center w-20">Detail</th>
          </tr>
        </thead>
        <tbody>
          @if (isLoading() && templates().length === 0) {
            @for (sk of [1,2,3,4,5]; track sk) {
              <tr class="border-b" style="border-color:rgba(255,255,255,0.04);">
                @for (col of [1,2,3,4,5,6,7,8]; track col) {
                  <td class="px-4 py-3">
                    <div class="h-4 rounded animate-pulse" style="background:rgba(255,255,255,0.06);" [style.width.px]="col === 1 ? 120 : col < 4 ? 60 : 40"></div>
                  </td>
                }
              </tr>
            }
          } @else if (filteredTemplates().length === 0) {
            <tr>
              <td colspan="8" class="px-5 py-12 text-center">
                <div class="flex flex-col items-center gap-3 text-app-muted">
                  <mat-icon class="!w-10 !h-10 !text-[40px] opacity-20">chat_bubble_outline</mat-icon>
                  <div class="text-sm">No templates found</div>
                  <div class="text-xs opacity-60">Configure WhatsApp integration to see live data</div>
                </div>
              </td>
            </tr>
          } @else {
            @for (t of filteredTemplates(); track t.templateName) {
              <tr class="border-b hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  style="border-color:rgba(255,255,255,0.04);"
                  (click)="openTemplateDetail(t.templateName)">

                <!-- Template Name -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-2">
                    @if (isTopTemplate(t)) {
                      <mat-icon class="!text-[14px] !w-[14px] !h-[14px] shrink-0 text-amber-400">emoji_events</mat-icon>
                    }
                    <span class="font-mono text-sm font-semibold text-app-text group-hover:text-green-400 transition-colors">{{ t.templateName }}</span>
                  </div>
                </td>

                <!-- Category -->
                <td class="px-4 py-3.5">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20': t.category === 'utility',
                          'bg-purple-500/10 text-purple-400 border border-purple-500/20': t.category === 'marketing',
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20': t.category === 'authentication',
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20': !['utility','marketing','authentication'].includes(t.category)
                        }">
                    {{ t.category }}
                  </span>
                </td>

                <!-- Status -->
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full shrink-0"
                          [ngClass]="{
                            'bg-emerald-400': t.status === 'APPROVED' || t.status === 'ACTIVE',
                            'bg-amber-400 animate-pulse': t.status === 'PENDING',
                            'bg-rose-400': t.status === 'REJECTED',
                            'bg-slate-400': !['APPROVED','ACTIVE','PENDING','REJECTED'].includes(t.status)
                          }"></span>
                    <span class="text-[10px] font-semibold text-app-muted">{{ t.status }}</span>
                  </div>
                </td>

                <!-- Sent -->
                <td class="px-4 py-3.5 text-right font-mono text-sm text-app-text">{{ t.sent | number }}</td>

                <!-- Delivered -->
                <td class="px-4 py-3.5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <span class="font-mono text-sm text-app-text">{{ t.delivered | number }}</span>
                    <div class="w-12 h-1.5 rounded-full overflow-hidden bg-app-bg">
                      <div class="h-full rounded-full" style="background:#818cf8;" [style.width.%]="t.deliveryRate"></div>
                    </div>
                  </div>
                </td>

                <!-- Read Rate -->
                <td class="px-4 py-3.5 text-right">
                  <span class="text-sm font-bold font-mono"
                        [ngClass]="{
                          'text-emerald-400': t.readRate >= 70,
                          'text-amber-400': t.readRate >= 40 && t.readRate < 70,
                          'text-rose-400': t.readRate < 40
                        }">{{ t.readRate }}%</span>
                </td>

                <!-- Cost -->
                <td class="px-4 py-3.5 text-right font-mono text-sm text-amber-400 font-semibold">
                  ₹{{ t.cost | number:'1.2-2' }}
                </td>

                <!-- Detail button -->
                <td class="px-4 py-3.5 text-center">
                  <button (click)="openTemplateDetail(t.templateName); $event.stopPropagation()"
                          class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition opacity-0 group-hover:opacity-100"
                          style="background:rgba(37,211,102,0.08); border-color:rgba(37,211,102,0.2); color:#25d366;">
                    View
                  </button>
                </td>
              </tr>
            }
          }
        </tbody>
        @if (filteredTemplates().length > 0) {
          <tfoot>
            <tr style="background:rgba(255,255,255,0.02); border-top:1px solid rgba(255,255,255,0.06);">
              <td class="px-5 py-3 text-[10px] font-bold text-app-muted uppercase tracking-wider" colspan="3">TOTAL</td>
              <td class="px-4 py-3 text-right font-mono text-sm font-black text-app-text">{{ totalSent() | number }}</td>
              <td class="px-4 py-3 text-right font-mono text-sm font-black text-app-text">{{ totalDelivered() | number }}</td>
              <td class="px-4 py-3 text-right font-mono text-sm font-black text-app-text">{{ avgReadRate() }}%</td>
              <td class="px-4 py-3 text-right font-mono text-sm font-black text-amber-400">₹{{ totalCost() | number:'1.2-2' }}</td>
              <td></td>
            </tr>
          </tfoot>
        }
      </table>
    </div>
  </div>

  <!-- ── DATA SOURCE BADGE ──────────────────────────────────────────────── -->
  <div class="flex items-center justify-between text-[10px] text-app-muted px-1">
    <span>
      Data source:
      <span class="font-semibold"
            [class.text-green-400]="summary()?.dataSource === 'firestore'"
            [class.text-amber-400]="summary()?.dataSource === 'simulated'">
        {{ summary()?.dataSource === 'firestore' ? '🔥 Firestore (Live)' : '⚡ Simulated (Firestore offline)' }}
      </span>
    </span>
    <span>Last updated: {{ summary()?.lastUpdated | date:'HH:mm:ss' }}</span>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════════════
  TEMPLATE DETAIL DRAWER (slide-in panel)
══════════════════════════════════════════════════════════════════════════ -->
@if (selectedTemplate()) {
  <!-- Backdrop -->
  <div class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
       (click)="closeTemplateDetail()"></div>

  <!-- Drawer -->
  <div class="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg overflow-y-auto animate-in slide-in-from-right duration-300"
       style="background:#0d1117; border-left:1px solid rgba(255,255,255,0.1);">

    <!-- Drawer Header -->
    <div class="sticky top-0 px-6 py-4 border-b flex items-center justify-between z-10"
         style="background:#0d1117; border-color:rgba(255,255,255,0.08);">
      <div>
        <div class="text-[10px] font-bold text-app-muted uppercase tracking-widest mb-0.5">Template Detail</div>
        <h3 class="text-base font-black text-app-text font-mono">{{ selectedTemplateName() }}</h3>
      </div>
      <button (click)="closeTemplateDetail()" id="wa-drawer-close-btn"
              class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition text-app-muted hover:text-app-text">
        <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">close</mat-icon>
      </button>
    </div>

    <div class="p-6 space-y-6">
      @if (isDetailLoading()) {
        <!-- Skeleton loader -->
        @for (i of [1,2,3,4]; track i) {
          <div class="h-16 rounded-xl animate-pulse" style="background:rgba(255,255,255,0.05);"></div>
        }
      } @else if (selectedTemplate()) {
        <!-- Status + Category badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                [ngClass]="{
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': selectedTemplate()!.status === 'APPROVED' || selectedTemplate()!.status === 'ACTIVE',
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20': selectedTemplate()!.status === 'PENDING',
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20': selectedTemplate()!.status === 'REJECTED'
                }">{{ selectedTemplate()!.status }}</span>
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {{ selectedTemplate()!.category }}
          </span>
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-app-bg text-app-muted border border-app-border">
            {{ selectedTemplate()!.language }}
          </span>
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                [ngClass]="{
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': selectedTemplate()!.qualityScore === 'GREEN',
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20': selectedTemplate()!.qualityScore === 'YELLOW',
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20': selectedTemplate()!.qualityScore === 'RED'
                }">
            Quality: {{ selectedTemplate()!.qualityScore }}
          </span>
        </div>

        <!-- Metrics grid -->
        <div class="grid grid-cols-2 gap-3">
          @for (metric of templateMetricCards(); track metric.label) {
            <div class="rounded-xl p-4 border" style="background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.06);">
              <div class="text-[10px] text-app-muted uppercase tracking-wider mb-1">{{ metric.label }}</div>
              <div class="text-2xl font-black font-mono" [style.color]="metric.color">{{ metric.value }}</div>
              @if (metric.sub) {
                <div class="text-[10px] text-app-muted mt-1">{{ metric.sub }}</div>
              }
            </div>
          }
        </div>

        <!-- Mini chart (sent/delivered/read bars) -->
        @if (selectedTemplate()!.graph && selectedTemplate()!.graph.labels.length > 0) {
          <div class="rounded-xl p-4 border space-y-2" style="background:rgba(255,255,255,0.02); border-color:rgba(255,255,255,0.06);">
            <div class="text-xs font-bold text-app-muted uppercase tracking-wider mb-3">Activity — Last 24hrs (5-min buckets)</div>
            <div class="flex items-end gap-1 h-20">
              @for (val of selectedTemplate()!.graph.sent; track $index) {
                <div class="flex-1 rounded-t transition-all duration-500"
                     style="background:rgba(37,211,102,0.6); min-height:2px;"
                     [style.height.%]="maxVal(selectedTemplate()!.graph.sent) > 0 ? (val / maxVal(selectedTemplate()!.graph.sent)) * 100 : 2">
                </div>
              }
            </div>
            <div class="flex justify-between text-[9px] text-app-muted font-mono">
              <span>{{ selectedTemplate()!.graph.labels[0] }}</span>
              <span>{{ selectedTemplate()!.graph.labels[selectedTemplate()!.graph.labels.length - 1] }}</span>
            </div>
          </div>
        }

        <!-- Cost breakdown -->
        <div class="rounded-xl p-4 border space-y-3" style="background:rgba(245,158,11,0.04); border-color:rgba(245,158,11,0.15);">
          <div class="text-xs font-bold text-amber-400 uppercase tracking-wider">Cost Breakdown</div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-app-muted">Total billable messages</span>
              <span class="font-mono font-bold text-app-text">{{ selectedTemplate()!.metrics.total | number }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-app-muted">Rate ({{ selectedTemplate()!.category }})</span>
              <span class="font-mono font-bold text-app-text">
                ₹{{ selectedTemplate()!.category === 'marketing' ? '0.50' : selectedTemplate()!.category === 'authentication' ? '0.30' : '0.35' }}/msg
              </span>
            </div>
            <div class="border-t pt-2 flex justify-between text-base font-black" style="border-color:rgba(245,158,11,0.2);">
              <span class="text-app-text">Total Cost</span>
              <span class="text-amber-400 font-mono">₹{{ selectedTemplate()!.metrics.cost | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  </div>
}

<!-- ── Toast notification ──────────────────────────────────────────────── -->
@if (toast().visible) {
  <div id="wa-toast"
       class="fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
       style="background:rgba(13,17,23,0.97); border-color:rgba(255,255,255,0.1);">
    <mat-icon class="!text-[20px] !w-5 !h-5 shrink-0"
              [ngClass]="{
                'text-emerald-400': toast().type === 'success',
                'text-rose-400': toast().type === 'error',
                'text-amber-400': toast().type === 'info'
              }">
      {{ toast().type === 'success' ? 'check_circle' : toast().type === 'error' ? 'error' : 'info' }}
    </mat-icon>
    <span class="text-sm font-medium text-app-text">{{ toast().message }}</span>
  </div>
}
  `
})
export class WhatsAppBillingComponent implements OnInit, OnDestroy {
  project = input.required<ProjectData>();

  private waService = inject(WhatsappBillingService);
  private cdr = inject(ChangeDetectorRef);

  // ── Exposed Math for template ──
  protected Math = Math;

  // ── State ──
  isLoading = signal(true);
  summary = signal<WaBillingSummary | null>(null);
  templates = signal<WaTemplateStat[]>([]);
  graph = signal<WaGraphData | null>(null);
  templateSearch = '';
  selectedTemplateName = signal<string | null>(null);
  selectedTemplate = signal<WaTemplateDetail | null>(null);
  isDetailLoading = signal(false);
  costAlertThreshold = 50; // ₹50/hr triggers alert

  toast = signal<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false, message: '', type: 'success'
  });

  // ── Chart dimensions ──
  chartWidth = 800;

  // ── Subscriptions ──
  private subs: Subscription[] = [];

  // ── Computed values ──
  filteredTemplates = computed(() => {
    const search = this.templateSearch.toLowerCase().trim();
    return this.templates().filter(t =>
      !search || t.templateName.toLowerCase().includes(search) || t.category.toLowerCase().includes(search)
    );
  });

  topTemplate = computed(() => {
    const ts = this.templates();
    if (!ts.length) return null;
    return ts.reduce((best, t) => {
      const bestTotal = best.sent + best.delivered + best.read;
      const tTotal = t.sent + t.delivered + t.read;
      return tTotal > bestTotal ? t : best;
    });
  });

  totalSent = computed(() => this.filteredTemplates().reduce((s, t) => s + t.sent, 0));
  totalDelivered = computed(() => this.filteredTemplates().reduce((s, t) => s + t.delivered, 0));
  totalCost = computed(() => Math.round(this.filteredTemplates().reduce((s, t) => s + t.cost, 0) * 100) / 100);
  avgReadRate = computed(() => {
    const ts = this.filteredTemplates();
    if (!ts.length) return 0;
    return Math.round(ts.reduce((s, t) => s + t.readRate, 0) / ts.length);
  });

  templateMetricCards = computed(() => {
    const d = this.selectedTemplate();
    if (!d) return [];
    return [
      { label: 'Messages Sent', value: (d.metrics.sent).toLocaleString(), color: '#25d366', sub: null },
      { label: 'Delivered', value: (d.metrics.delivered).toLocaleString(), color: '#818cf8', sub: `${d.metrics.deliveryRate}% rate` },
      { label: 'Read', value: (d.metrics.read).toLocaleString(), color: '#fbbf24', sub: `${d.metrics.readRate}% read rate` },
      { label: 'Total Cost', value: `₹${d.metrics.cost.toFixed(2)}`, color: '#f59e0b', sub: `₹${d.metrics.costPerMessage.toFixed(4)}/msg` },
    ];
  });

  ngOnInit(): void {
    const appId = this.project().id;
    this.waService.startPolling(appId);

    this.subs.push(
      this.waService.summary$.subscribe(s => {
        this.summary.set(s);
        if (s) this.isLoading.set(false);
        this.cdr.markForCheck();
      }),
      this.waService.templates$.subscribe(t => {
        this.templates.set(t);
        this.cdr.markForCheck();
      }),
      this.waService.graph$.subscribe(g => {
        this.graph.set(g);
        this.cdr.markForCheck();
      }),
      this.waService.loading$.subscribe(l => {
        this.isLoading.set(l);
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.waService.stopPolling();
  }

  // ── Actions ──
  refreshAll(): void {
    const appId = this.project().id;
    this.isLoading.set(true);
    this.waService.fetchAll(appId);
    this.showToast('Refreshing realtime data…', 'info');
  }

  exportCSV(): void {
    const appName = this.project().name || 'app';
    this.waService.exportTemplatesCSV(this.templates(), appName);
    this.showToast('CSV exported successfully!', 'success');
  }

  openTemplateDetail(name: string): void {
    this.selectedTemplateName.set(name);
    this.selectedTemplate.set(null);
    this.isDetailLoading.set(true);
    const appId = this.project().id;
    this.waService.getTemplateDetail(appId, name).subscribe(d => {
      this.selectedTemplate.set(d);
      this.isDetailLoading.set(false);
      this.cdr.markForCheck();
    });
  }

  closeTemplateDetail(): void {
    this.selectedTemplateName.set(null);
    this.selectedTemplate.set(null);
  }

  isTopTemplate(t: WaTemplateStat): boolean {
    const top = this.topTemplate();
    return !!top && top.templateName === t.templateName;
  }

  // ── Chart helpers ──
  buildPolylinePoints(values: number[]): string {
    if (!values || values.length === 0) return '';
    const max = Math.max(...values, 1);
    const height = 140;
    const width = this.chartWidth;
    const stepX = width / (values.length - 1 || 1);
    return values.map((v, i) => {
      const x = i * stepX;
      const y = height - (v / max) * (height - 10);
      return `${x},${y}`;
    }).join(' ');
  }

  maxVal(arr: number[]): number {
    return Math.max(...arr, 1);
  }

  // ── Toast ──
  private toastTimer: any;
  showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    clearTimeout(this.toastTimer);
    this.toast.set({ visible: true, message, type });
    this.toastTimer = setTimeout(() => {
      this.toast.set({ visible: false, message: '', type: 'success' });
      this.cdr.markForCheck();
    }, 3500);
  }
}
