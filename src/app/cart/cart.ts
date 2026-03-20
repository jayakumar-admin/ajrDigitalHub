import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, MatIconModule, FormsModule, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  cartService = inject(CartService);
  auth = inject(AuthService);

  submitting = signal(false);
  customerData = {
    name: '',
    businessName: '',
    phone: '',
    email: ''
  };

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.customerData.email = user.email || '';
        this.customerData.name = user.displayName || '';
      }
    });
  }

  plans = [
    {
      id: '1',
      name: 'Business Website',
      price: 2999,
      features: ['Unlimited Disk', 'Unlimited Emails', 'Unlimited Database', 'Enquiry Form', 'Free SSL']
    },
    {
      id: '2',
      name: 'E-Commerce Website',
      price: 4999,
      features: ['Product Admin Panel', 'Payment Gateway', 'Email Notifications', 'Reviews Feature']
    },
    {
      id: '3',
      name: 'E-Commerce + App',
      price: 9999,
      features: ['E-Commerce Website', 'Android App', 'Secure Checkout', 'Live Tracking']
    }
  ];

  async handleOrder(event: Event) {
    event.preventDefault();
    this.submitting.set(true);
    try {
      await this.cartService.submitOrder(this.customerData);
      alert('Thank you! Your order request has been submitted. Our team will contact you shortly.');
    } catch {
      alert('There was an error submitting your order. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
