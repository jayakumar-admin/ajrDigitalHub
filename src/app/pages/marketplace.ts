import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Product {
  id: number;
  title: string;
  author: string;
  price: number;
  rating: number;
  sales: number;
  category: string;
  imageUrl: string;
  addedToCart?: boolean;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './marketplace.html'
})
export class MarketplaceComponent {
  categories = signal(['All', 'Admin Dashboards', 'Landing Pages', 'E-commerce', 'Portfolio', 'UI Kits']);
  activeCategory = signal('All');

  addToCart(product: Product) {
    product.addedToCart = true;
    setTimeout(() => {
      product.addedToCart = false;
    }, 2000);
  }

  products = signal<Product[]>([
    {
      id: 1,
      title: 'Nexus - Modern Admin Dashboard',
      author: 'AJR Studios',
      price: 49,
      rating: 4.9,
      sales: 1240,
      category: 'Admin Dashboards',
      imageUrl: 'https://picsum.photos/seed/admin1/800/600'
    },
    {
      id: 2,
      title: 'Lumina - SaaS Landing Page',
      author: 'PixelCraft',
      price: 29,
      rating: 4.8,
      sales: 856,
      category: 'Landing Pages',
      imageUrl: 'https://picsum.photos/seed/saas1/800/600'
    },
    {
      id: 3,
      title: 'ShopifyPro - E-commerce Theme',
      author: 'WebMasters',
      price: 79,
      rating: 4.7,
      sales: 2100,
      category: 'E-commerce',
      imageUrl: 'https://picsum.photos/seed/shop1/800/600'
    },
    {
      id: 4,
      title: 'Aura - Minimalist Portfolio',
      author: 'DesignHub',
      price: 39,
      rating: 5.0,
      sales: 432,
      category: 'Portfolio',
      imageUrl: 'https://picsum.photos/seed/port1/800/600'
    },
    {
      id: 5,
      title: 'Velocity - UI Component Kit',
      author: 'AJR Studios',
      price: 59,
      rating: 4.9,
      sales: 3200,
      category: 'UI Kits',
      imageUrl: 'https://picsum.photos/seed/ui1/800/600'
    },
    {
      id: 6,
      title: 'Zenith - Corporate Landing Page',
      author: 'CreativeMinds',
      price: 34,
      rating: 4.6,
      sales: 650,
      category: 'Landing Pages',
      imageUrl: 'https://picsum.photos/seed/corp1/800/600'
    },
    {
      id: 7,
      title: 'StoreFront - Next.js E-commerce',
      author: 'CodeArtisan',
      price: 89,
      rating: 4.8,
      sales: 1100,
      category: 'E-commerce',
      imageUrl: 'https://picsum.photos/seed/shop2/800/600'
    },
    {
      id: 8,
      title: 'Metrics - Analytics Dashboard',
      author: 'DataViz',
      price: 54,
      rating: 4.7,
      sales: 890,
      category: 'Admin Dashboards',
      imageUrl: 'https://picsum.photos/seed/admin2/800/600'
    }
  ]);

  get filteredProducts() {
    return signal(
      this.activeCategory() === 'All' 
        ? this.products() 
        : this.products().filter(p => p.category === this.activeCategory())
    );
  }
}
