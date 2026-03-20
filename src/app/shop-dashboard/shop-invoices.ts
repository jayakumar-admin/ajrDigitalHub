import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface Invoice {
  id: string;
  number: string;
  customerName: string;
  amount: number;
  date: Date;
  status: 'Paid' | 'Pending' | 'Overdue';
}

@Component({
  selector: 'app-shop-invoices',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, CurrencyPipe],
  templateUrl: './shop-invoices.html',
  styleUrl: './shop-invoices.css'
})
export class ShopInvoicesComponent {
  invoices = signal<Invoice[]>([
    { id: '1', number: 'INV-2026-001', customerName: 'Acme Corp', amount: 1200.00, date: new Date('2026-03-17'), status: 'Paid' },
    { id: '2', number: 'INV-2026-002', customerName: 'Globex Corporation', amount: 450.50, date: new Date('2026-03-16'), status: 'Pending' },
    { id: '3', number: 'INV-2026-003', customerName: 'Soylent Corp', amount: 3200.00, date: new Date('2026-03-10'), status: 'Overdue' },
    { id: '4', number: 'INV-2026-004', customerName: 'Initech', amount: 850.00, date: new Date('2026-03-18'), status: 'Pending' }
  ]);
}
