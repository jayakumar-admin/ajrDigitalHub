import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-demo-explorer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './demo-explorer.html',
  styleUrl: './demo-explorer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoExplorer {
  route = inject(ActivatedRoute);
  demoType = signal('business');

  availableDemos = [
    { type: 'business', label: 'Business' },
    { type: 'restaurant', label: 'Restaurant' },
    { type: 'portfolio', label: 'Portfolio' },
    { type: 'ecommerce', label: 'E-Commerce' },
    { type: 'education', label: 'Education' }
  ];

  navItems = ['Overview', 'Features', 'Pricing', 'Testimonials', 'Contact Us', 'Our Team', 'Blog'];

  constructor() {
    this.route.params.subscribe(params => {
      if (params['type']) {
        this.demoType.set(params['type']);
      }
    });
  }

  getIcon() {
    switch (this.demoType()) {
      case 'business': return 'business';
      case 'restaurant': return 'restaurant';
      case 'portfolio': return 'person';
      case 'ecommerce': return 'shopping_bag';
      case 'education': return 'school';
      default: return 'web';
    }
  }
}
