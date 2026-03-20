import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Customer {
  id: string;
  name: string;
  email: string;
  initial: string;
}

@Component({
  selector: 'app-shop-customers',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './shop-customers.html',
  styleUrl: './shop-customers.css'
})
export class ShopCustomersComponent {
  customers = signal<Customer[]>([
    { id: '1', name: 'Acme Corp', email: 'contact@acmecorp.com', initial: 'A' },
    { id: '2', name: 'Globex Corporation', email: 'billing@globex.com', initial: 'G' },
    { id: '3', name: 'Soylent Corp', email: 'accounts@soylent.com', initial: 'S' },
    { id: '4', name: 'Initech', email: 'finance@initech.com', initial: 'I' },
    { id: '5', name: 'Umbrella Corporation', email: 'admin@umbrella.com', initial: 'U' }
  ]);
}
