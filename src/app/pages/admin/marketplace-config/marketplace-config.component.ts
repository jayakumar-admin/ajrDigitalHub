import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { EditorComponent } from '../marketplace-editor/editor.component';
import { PreviewComponent } from '../marketplace-preview/preview.component';
import { MarketplaceSidebarComponent, BuilderTemplate } from './marketplace-sidebar.component';
import { MarketplaceToolbarComponent } from './marketplace-toolbar.component';

interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  html_content: string;
  status: string;
  created_at?: Date;
}

@Component({
  selector: 'app-marketplace-config',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule, 
    EditorComponent, 
    PreviewComponent,
    MarketplaceSidebarComponent,
    MarketplaceToolbarComponent
  ],
  templateUrl: './marketplace-config.component.html'
})
export class MarketplaceConfigComponent implements OnInit {
  private http = inject(HttpClient);
  
  items = signal<MarketplaceItem[]>([]);
  activeItem = signal<Partial<MarketplaceItem> | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  currentDevice = signal('desktop');
  
  ngOnInit() {
    this.loadItems();
  }
  
  loadItems() {
    this.isLoading.set(true);
    this.http.get<MarketplaceItem[]>('/api/admin/marketplace-items').subscribe({
      next: (res) => {
        this.items.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
  
  createNew() {
    this.activeItem.set({
      title: 'New Dynamic Asset',
      description: 'A dynamic UI block created with the builder.',
      price: 19.99,
      category: 'Hero',
      html_content: '',
      status: 'active'
    });
  }

  onSelectTemplate(template: BuilderTemplate) {
     const item = this.activeItem();
     if (item) {
        this.activeItem.set({
          ...item,
          html_content: template.html
        });
     }
  }
  
  editItem(item: MarketplaceItem) {
    this.activeItem.set({ ...item });
  }
  
  deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this custom item?')) {
      this.http.delete('/api/admin/marketplace-items/' + id).subscribe(() => {
        this.loadItems();
        if (this.activeItem()?.id === id) {
          this.activeItem.set(null);
        }
      });
    }
  }
  
  saveItem() {
    const item = this.activeItem();
    if (!item || !item.title) return;
    
    this.isSaving.set(true);
    if (item.id) {
      this.http.put('/api/admin/marketplace-items/' + item.id, item).subscribe({
        next: () => {
          this.loadItems();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.http.post('/api/admin/marketplace-items', item).subscribe({
        next: (res: any) => {
          this.activeItem.set(res);
          this.loadItems();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false)
      });
    }
  }
  
  cancelEdit() {
    this.activeItem.set(null);
  }
}
