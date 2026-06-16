import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ApiService, Product } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AdminData } from '../../services/admin-data';
import { TechBackground, FloatingCard, GlowButton } from '../../shared/tech-ui';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TechBackground, FloatingCard, GlowButton],
  templateUrl: './marketplace.html'
})
export class MarketplaceComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private adminData = inject(AdminData);
  private router = inject(Router);

  isMarketplaceFeatureActive = computed(() => this.adminData.websiteConfig().features.marketplace);

  products = signal<Product[]>([]);
  dynamicItems = signal<any[]>([]); // Items from CMS
  
  // Combine for UI, with dynamic items taking priority
  combinedItems = computed(() => {
    return [
      ...this.dynamicItems().map(item => ({ isDynamic: true, ...item })),
      ...this.products().map(item => ({ isDynamic: false, ...item }))
    ];
  });

  categories = ['All', 'Design', 'Code', 'Content', 'Services'];
  selectedCategory = signal('All');
  searchQuery = signal('');
  loading = signal(false);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    const cat = this.selectedCategory() === 'All' ? undefined : this.selectedCategory();
    
    // We fetch both dynamic items from the CMS and standard products
    forkJoin({
       dynamic: this.apiService.get<any[]>('/admin/marketplace-items'),
       products: this.apiService.getProducts(cat, this.searchQuery())
    }).subscribe({
      next: (res) => {
        let activeItems = (res.dynamic || []).filter(item => item.status === 'active');
        if (this.searchQuery()) {
          activeItems = activeItems.filter(item => item.title.toLowerCase().includes(this.searchQuery().toLowerCase()));
        }
        this.dynamicItems.set(activeItems);
        this.products.set(res.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.loadProducts();
  }

  onSearch() {
    this.loadProducts();
  }

  buyNow(product: any) {
    if (!this.authService.currentUser()) {
      alert('Please login to purchase products.');
      return;
    }
    
    if (confirm(`Purchase ${product.title} for ₹${product.price}?`)) {
      if (product.isDynamic) {
        alert('Purchase successful! Dynamic Asset added to your dashboard.');
      } else {
        this.apiService.purchaseProduct(product.id, product.price).subscribe({
          next: () => alert('Purchase successful! Item added to your dashboard.'),
          error: (err) => alert('Purchase failed: ' + err.error?.error)
        });
      }
    }
  }
  
  viewPreview(product: any) {
    this.router.navigate(['/marketplace/preview', product.id]);
  }
}
