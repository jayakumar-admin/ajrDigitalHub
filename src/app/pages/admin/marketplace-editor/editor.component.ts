import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-marketplace-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-[#1e1e1e] overflow-hidden shadow-2xl relative">
       <div class="bg-[#2d2d2d] px-4 h-9 flex justify-between items-center shrink-0 border-b border-white/5">
          <div class="flex h-full">
             <div class="px-4 h-full flex items-center bg-[#1e1e1e] border-t-2 border-indigo-500 text-[11px] font-bold text-white uppercase tracking-wider cursor-default">
                index.html
             </div>
             <div class="px-4 h-full flex items-center text-white/30 text-[11px] font-bold uppercase tracking-wider hover:text-white/60 transition-colors cursor-pointer border-r border-white/5">
                styles.css
             </div>
          </div>
          <div class="flex items-center gap-3">
             <button class="text-white/40 hover:text-white transition-colors" title="Format Code">
                <mat-icon class="!w-4 !h-4 !text-[16px]">format_align_left</mat-icon>
             </button>
          </div>
       </div>
       <div class="flex-grow relative group">
          <!-- Line Numbers -->
          <div class="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-white/5 flex flex-col items-center pt-4 text-[#858585] text-[10px] font-mono leading-6 select-none pointer-events-none">
             @for (n of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]; track n) {
                <span>{{ n }}</span>
             }
          </div>
          <textarea 
            class="w-full h-full p-4 pl-12 bg-transparent text-[#d4d4d4] font-mono text-sm resize-none outline-none focus:ring-0 leading-6"
            placeholder="<!-- Enter HTML here... -->"
            [ngModel]="htmlCode" 
            (ngModelChange)="onCodeChange($event)"
            spellcheck="false"
          ></textarea>
       </div>
       
       <!-- Status Bar -->
       <div class="h-6 bg-[#007acc] px-3 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3 text-[10px] text-white/90 font-medium font-mono uppercase">
             <div class="flex items-center gap-1">
               <mat-icon class="!w-3 !h-3 !text-[12px]">source</mat-icon> UTF-8
             </div>
             <div class="flex items-center gap-1">
               <mat-icon class="!w-3 !h-3 !text-[12px]">code</mat-icon> HTML
             </div>
          </div>
          <div class="text-[10px] text-white/80 font-mono">
            Ln 1, Col 1
          </div>
       </div>
    </div>
  `
})
export class EditorComponent {
  @Input() htmlCode = '';
  @Output() htmlCodeChange = new EventEmitter<string>();
  
  // Debounce logic
  private timeout: any;
  
  onCodeChange(val: string) {
    this.htmlCode = val;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.htmlCodeChange.emit(val);
    }, 300); // 300ms debounce
  }
}
