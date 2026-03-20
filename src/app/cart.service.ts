import { Injectable, signal, computed } from '@angular/core';
import { Theme } from './theme.service';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface CartItem {
  theme: Theme;
  plan: PricingPlan;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items = signal<CartItem[]>([]);

  cartItems = this.items.asReadonly();
  
  totalCount = computed(() => this.items().length);
  
  totalPrice = computed(() => {
    return this.items().reduce((acc, item) => acc + item.plan.price, 0);
  });

  addToCart(theme: Theme, plan: PricingPlan) {
    this.items.update(items => [...items, { theme, plan }]);
  }

  removeFromCart(index: number) {
    this.items.update(items => items.filter((_, i) => i !== index));
  }

  clearCart() {
    this.items.set([]);
  }

  async submitOrder(customerData: { name: string, businessName: string, phone: string, email: string }) {
    const orderData = {
      customerName: customerData.name,
      businessName: customerData.businessName,
      phone: customerData.phone,
      email: customerData.email,
      items: this.items().map(item => ({
        themeId: item.theme.id,
        themeName: item.theme.name,
        planName: item.plan.name,
        price: item.plan.price
      })),
      totalPrice: this.totalPrice(),
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      this.clearCart();
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  }

  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
}
