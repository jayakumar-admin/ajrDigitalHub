import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-shop-products',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  templateUrl: './shop-products.html',
  styleUrl: './shop-products.css'
})
export class ShopProductsComponent {
  products = signal<Product[]>([
    { id: '1', name: 'Web Development Service', description: 'Custom website design and development.', price: 1500 },
    { id: '2', name: 'SEO Optimization', description: 'Monthly SEO optimization and reporting.', price: 500 },
    { id: '3', name: 'Logo Design', description: 'Professional logo design with 3 revisions.', price: 250 },
    { id: '4', name: 'Social Media Management', description: 'Managing 3 social media platforms per month.', price: 800 }
  ]);
}
