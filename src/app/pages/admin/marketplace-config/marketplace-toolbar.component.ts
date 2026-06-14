import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-marketplace-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  template: `
    <div class="h-14 bg-app-card border-b border-app-border flex items-center justify-between px-4 shrink-0">
      <div class="flex items-center gap-4 flex-grow px-2">
        <div class="flex items-center gap-2 shrink-0">
           <mat-icon class="text-indigo-500">auto_fix_high</mat-icon>
           <span class="text-xs font-black text-app-text uppercase tracking-tighter">Asset Builder</span>
        </div>
        <div class="w-px h-6 bg-app-border mx-2"></div>
        
        <div class="flex items-center gap-2 flex-grow max-w-xl">
           <div class="flex flex-col min-w-[200px]">
              <input type="text" [(ngModel)]="title" (ngModelChange)="titleChange.emit($event)" 
                     class="bg-transparent border-none text-[13px] font-black text-app-text outline-none placeholder:text-app-muted/50"
                     placeholder="Unnamed Asset">
           </div>
           
           <div class="w-px h-4 bg-app-border"></div>
           
           <div class="flex items-center gap-1 min-w-[100px]">
              <span class="text-[10px] font-bold text-app-muted uppercase">₹</span>
              <input type="number" [ngModel]="price" (ngModelChange)="priceChange.emit($event)" 
                     class="bg-transparent border-none text-[13px] font-mono text-indigo-400 outline-none w-16"
                     placeholder="0.00">
           </div>

           <div class="w-px h-4 bg-app-border"></div>

           <div class="flex items-center gap-1 min-w-[120px]">
              <select [ngModel]="category" (ngModelChange)="categoryChange.emit($event)"
                      class="bg-transparent border-none text-[10px] font-bold text-app-muted uppercase outline-none cursor-pointer hover:text-app-text transition-colors">
                 <option value="Hero">Hero Section</option>
                 <option value="Cards">Product Cards</option>
                 <option value="Pricing">Pricing Table</option>
                 <option value="Landing">Landing Block</option>
                 <option value="Content">Content Block</option>
              </select>
           </div>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <!-- Device Toggles -->
        <div class="flex bg-app-bg border border-app-border rounded-lg p-0.5">
           <button (click)="deviceChange.emit('desktop')" [class.bg-app-card]="currentDevice === 'desktop'" class="p-1 px-2 rounded-md hover:text-indigo-400 transition-colors">
              <mat-icon class="!w-5 !h-5 !text-[20px]">desktop_windows</mat-icon>
           </button>
           <button (click)="deviceChange.emit('tablet')" [class.bg-app-card]="currentDevice === 'tablet'" class="p-1 px-2 rounded-md hover:text-indigo-400 transition-colors">
              <mat-icon class="!w-5 !h-5 !text-[20px]">tablet_mac</mat-icon>
           </button>
           <button (click)="deviceChange.emit('mobile')" [class.bg-app-card]="currentDevice === 'mobile'" class="p-1 px-2 rounded-md hover:text-indigo-400 transition-colors">
              <mat-icon class="!w-5 !h-5 !text-[20px]">smartphone</mat-icon>
           </button>
        </div>

        <div class="flex items-center gap-3">
           <button (click)="cancel.emit()" class="text-xs font-bold text-app-muted hover:text-app-text px-3 py-1.5 transition-colors">Exit</button>
           <button (click)="save.emit()" [disabled]="isSaving" 
                   class="bg-indigo-600 text-white px-5 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              @if (isSaving) {
                <mat-icon class="animate-spin !w-4 !h-4 !text-[16px]">refresh</mat-icon> Saving...
              } @else {
                <mat-icon class="!w-4 !h-4 !text-[16px]">publish</mat-icon> Publish Asset
              }
           </button>
        </div>
      </div>
    </div>
  `
})
export class MarketplaceToolbarComponent {
  @Input() title: string = '';
  @Input() price: number = 0;
  @Input() category: string = 'Hero';
  @Input() isSaving: boolean = false;
  @Input() currentDevice: string = 'desktop';

  @Output() titleChange = new EventEmitter<string>();
  @Output() priceChange = new EventEmitter<number>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() deviceChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
