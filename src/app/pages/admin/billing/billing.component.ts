import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-app-text tracking-tight">Automated Billing System</h1>
          <p class="text-sm text-app-muted mt-1">Manage monthly invoices, WhatsApp notifications, and HTML templates.</p>
        </div>
        <div class="flex gap-3">
          <button 
            (click)="runBillingJob()"
            class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow hover:bg-indigo-700 transition"
          >
            <mat-icon class="text-sm mr-2 inline-block align-middle">play_arrow</mat-icon>
            Run Billing Job
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-app-border gap-6">
        <button 
          (click)="activeTab.set('invoices')" 
          [class.border-b-2]="activeTab() === 'invoices'"
          [class.border-indigo-500]="activeTab() === 'invoices'"
          [class.text-indigo-400]="activeTab() === 'invoices'"
          class="pb-3 text-sm font-semibold text-app-muted hover:text-app-text transition"
        >
          Invoices
        </button>
        <button 
          (click)="activeTab.set('template')" 
          [class.border-b-2]="activeTab() === 'template'"
          [class.border-indigo-500]="activeTab() === 'template'"
          [class.text-indigo-400]="activeTab() === 'template'"
          class="pb-3 text-sm font-semibold text-app-muted hover:text-app-text transition"
        >
          Template Config
        </button>
      </div>

      <!-- Invoices Tab -->
      <div *ngIf="activeTab() === 'invoices'" class="space-y-4">
        <!-- Filters -->
        <div class="flex gap-4 items-center bg-app-card p-4 rounded-xl border border-app-border">
          <mat-icon class="text-app-muted">filter_list</mat-icon>
          <input 
            type="text" 
            [(ngModel)]="filterApp" 
            placeholder="Filter by App ID..." 
            class="bg-app-bg border border-app-border rounded-lg px-3 py-1.5 text-sm text-app-text w-64 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <!-- Table -->
        <div class="bg-app-card border border-app-border rounded-xl overflow-hidden">
          <table class="w-full text-left text-sm">
            <thead class="bg-app-bg/50 border-b border-app-border">
              <tr>
                <th class="p-4 font-semibold text-app-muted">App ID</th>
                <th class="p-4 font-semibold text-app-muted">Amount</th>
                <th class="p-4 font-semibold text-app-muted">Usage Breakdown</th>
                <th class="p-4 font-semibold text-app-muted">Status</th>
                <th class="p-4 font-semibold text-app-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Mock Row 1 -->
              <tr class="border-b border-app-border/50 hover:bg-app-bg/30">
                <td class="p-4 text-app-text font-medium">app-12345</td>
                <td class="p-4 text-emerald-400 font-bold">$12.50</td>
                <td class="p-4">
                  <div class="text-xs text-app-muted">API: 1250 <span class="text-indigo-400">(+250)</span></div>
                  <div class="text-xs text-app-muted">WA: 120 <span class="text-indigo-400">(+20)</span></div>
                </td>
                <td class="p-4">
                  <span class="inline-flex px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-wider">
                    Pending
                  </span>
                </td>
                <td class="p-4 flex gap-2">
                  <button class="text-indigo-400 hover:text-indigo-300 text-xs font-semibold px-2 py-1 border border-indigo-500/30 rounded" (click)="sendWhatsApp('123')">Send WA</button>
                  <button class="text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2 py-1 border border-emerald-500/30 rounded" (click)="markPaid('123')">Mark Paid</button>
                  <button class="text-app-muted hover:text-app-text text-xs font-semibold px-2 py-1 border border-app-border rounded">PDF</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Template Config Tab -->
      <div *ngIf="activeTab() === 'template'" class="flex h-[600px] gap-6">
        <!-- Editor (Left) -->
        <div class="w-1/2 flex flex-col bg-app-card border border-app-border rounded-xl overflow-hidden">
          <div class="p-4 border-b border-app-border flex justify-between items-center bg-app-bg/50">
            <span class="font-semibold text-sm text-app-text">HTML Template</span>
            <button class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded" (click)="saveTemplate()">
              Save Template
            </button>
          </div>
          <textarea 
            [(ngModel)]="htmlTemplate"
            (ngModelChange)="updatePreview()"
            class="flex-1 w-full bg-[#1e1e1e] text-indigo-300 p-4 font-mono text-sm resize-none focus:outline-none"
            spellcheck="false"
          ></textarea>
        </div>

        <!-- Preview (Right) -->
        <div class="w-1/2 flex flex-col bg-white border border-app-border rounded-xl overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <span class="font-semibold text-sm text-gray-700">Live PDF Preview</span>
            <span class="text-xs text-gray-500">Injects mock variables</span>
          </div>
          <div class="flex-1 p-8 overflow-y-auto" [innerHTML]="safeHtmlPreview"></div>
        </div>
      </div>

    </div>
  `
})
export class AdminBillingComponent implements OnInit {
  activeTab = signal<'invoices' | 'template'>('invoices');
  filterApp = '';

  htmlTemplate = '<div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px; margin: auto;">\n  <h1 style="color: #4f46e5;">Invoice for {{appId}}</h1>\n  <p>Thank you for using AJR Digital Hub.</p>\n  <hr/>\n  <div style="margin-top: 20px;">\n    <p><strong>Total Amount Due:</strong> $\{{amount}}</p>\n    <p><strong>API Usage:</strong> {{usage_api}} calls</p>\n    <p><strong>WhatsApp Usage:</strong> {{usage_whatsapp}} msgs</p>\n  </div>\n</div>';
  safeHtmlPreview: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.updatePreview();
  }

  updatePreview() {
    // Inject mock data for preview
    let preview = this.htmlTemplate
      .replace('{{appId}}', 'mock-app-001')
      .replace('{{amount}}', '12.50')
      .replace('{{usage_api}}', '1250')
      .replace('{{usage_whatsapp}}', '120');
      
    this.safeHtmlPreview = this.sanitizer.bypassSecurityTrustHtml(preview);
  }

  saveTemplate() {
    alert('Template saved to settings table.');
    // To implement: call API POST /api/admin/settings
  }

  runBillingJob() {
    alert('Billing job triggered. Generating invoices...');
    // To implement: call API POST /api/admin/billing/run
  }

  sendWhatsApp(id: string) {
    alert('WhatsApp reminder sent to contact.');
  }

  markPaid(id: string) {
    alert('Invoice marked as Paid.');
  }
}
