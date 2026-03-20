import { ChangeDetectionStrategy, Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, Unsubscribe } from 'firebase/firestore';

interface Order {
  id: string;
  customerName: string;
  businessName: string;
  totalPrice: number;
  status: string;
  createdAt: { toDate: () => Date };
  items: { themeName: string; price: number }[];
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe, DatePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrders implements OnDestroy {
  auth = inject(AuthService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  private unsubscribe: Unsubscribe | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (user?.email) {
        this.initOrdersListener(user.email);
      } else {
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private initOrdersListener(email: string) {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const q = query(
      collection(db, 'orders'),
      where('email', '==', email),
      orderBy('createdAt', 'desc')
    );

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Order[];
      this.orders.set(ordersData);
      this.loading.set(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      this.loading.set(false);
    });
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'completed': return 'bg-emerald-100 text-emerald-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  }
}
