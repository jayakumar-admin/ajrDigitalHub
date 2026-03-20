import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService, Theme } from '../theme.service';
import { AuthService } from '../auth.service';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Order {
  id: string;
  customerName: string;
  businessName: string;
  phone: string;
  email: string;
  totalPrice: number;
  status: string;
  createdAt: { toDate: () => Date };
  items: { themeName: string }[];
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CurrencyPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Admin {
  themeService = inject(ThemeService);
  auth = inject(AuthService);

  activeTab = signal<'themes' | 'orders'>('themes');
  orders = signal<Order[]>([]);
  totalRevenue = computed(() => this.orders().reduce((acc, order) => acc + (order.status === 'completed' ? order.totalPrice : 0), 0));
  pendingOrdersCount = computed(() => this.orders().filter(o => o.status === 'pending').length);
  
  showThemeModal = signal(false);
  editingTheme = signal<Theme | null>(null);
  
  themeForm: Omit<Theme, 'id'> = {
    name: '',
    category: 'Business',
    previewUrl: '',
    price: 2999,
    features: [],
    description: '',
    demoUrl: '',
    htmlContent: ''
  };

  constructor() {
    this.initOrdersListener();
  }

  private initOrdersListener() {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Order[];
      this.orders.set(ordersData);
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        this.themeForm.htmlContent = content;
      };
      reader.readAsText(file);
    }
  }

  openThemeModal(theme?: Theme) {
    if (theme) {
      this.editingTheme.set(theme);
      this.themeForm = { ...theme, htmlContent: theme.htmlContent || '' };
    } else {
      this.editingTheme.set(null);
      this.themeForm = {
        name: '',
        category: 'Business',
        previewUrl: '',
        price: 2999,
        features: [],
        description: '',
        demoUrl: '',
        htmlContent: ''
      };
    }
    this.showThemeModal.set(true);
  }

  closeThemeModal() {
    this.showThemeModal.set(false);
  }

  updateFeatures(value: string) {
    this.themeForm.features = value.split(',').map(f => f.trim()).filter(f => f !== '');
  }

  async saveTheme(event: Event) {
    event.preventDefault();
    try {
      if (this.editingTheme()) {
        await this.themeService.updateTheme(this.editingTheme()!.id, this.themeForm);
      } else {
        await this.themeService.addTheme(this.themeForm);
      }
      this.closeThemeModal();
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  async deleteTheme(id: string) {
    // In a real app, use a custom modal. confirm() is blocked in iframe.
    await this.themeService.deleteTheme(id);
  }

  async updateOrderStatus(id: string, status: string) {
    await updateDoc(doc(db, 'orders', id), { status });
  }

  async deleteOrder(id: string) {
    // In a real app, use a custom modal. confirm() is blocked in iframe.
    await deleteDoc(doc(db, 'orders', id));
  }

  isSeeding = signal(false);
  seedSuccess = signal(false);
  seedError = signal('');

  async seedThemes() {
    this.isSeeding.set(true);
    this.seedSuccess.set(false);
    this.seedError.set('');
    
    try {
      await this.themeService.seedThemes();
      this.seedSuccess.set(true);
      setTimeout(() => this.seedSuccess.set(false), 3000);
    } catch (error) {
      console.error('Error seeding themes:', error);
      this.seedError.set('Failed to seed themes. Check console for details.');
      setTimeout(() => this.seedError.set(''), 5000);
    } finally {
      this.isSeeding.set(false);
    }
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
