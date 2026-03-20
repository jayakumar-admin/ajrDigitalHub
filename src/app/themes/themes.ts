import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ThemeService, Theme } from '../theme.service';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [RouterLink, MatIconModule, FormsModule, CurrencyPipe],
  templateUrl: './themes.html',
  styleUrl: './themes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Themes {
  themeService = inject(ThemeService);
  cartService = inject(CartService);

  categories = ['All', 'Business', 'E-Commerce', 'Portfolio', 'Landing Page', 'Blog', 'Education', 'Restaurant'];
  selectedCategory = signal('All');
  searchQuery = signal('');

  filteredThemes = computed(() => {
    let themes = this.themeService.getThemes()();
    
    if (this.selectedCategory() !== 'All') {
      themes = themes.filter(t => t.category === this.selectedCategory());
    }

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      themes = themes.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query)
      );
    }

    return themes;
  });

  addToCart(theme: Theme) {
    // Default to Business Plan for now
    this.cartService.addToCart(theme, {
      id: '1',
      name: 'Business Website',
      price: 2999,
      features: ['Unlimited Disk', 'Unlimited Emails', 'Unlimited Database', 'Enquiry Form', 'Free SSL']
    });
    alert(`${theme.name} added to cart!`);
  }
}
