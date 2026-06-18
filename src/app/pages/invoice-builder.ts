import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-invoice-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './invoice-builder.html'
})
export class InvoiceBuilderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSent = signal(false);
  isSaving = signal(false);
  isLoading = signal(true);
  showLoginModal = signal(false);
  
  companyName = signal('AJR DIGITAL HUB');
  companyAddress = signal('123 Design Blvd, Suite 400\nSan Francisco, CA 94107\nhello@ajrdigital.hub');
  notesTemplate = signal('');

  confirmLogin() {
    this.showLoginModal.set(false);
    localStorage.setItem('redirectAfterLogin', this.router.url);
    this.router.navigate(['/login']);
  }

  getResolvedUrl(path: string): string {
    const override = typeof window !== 'undefined' ? localStorage.getItem('AJR_EXTERNAL_API_URL') : null;
    const base = override || environment.apiBaseUrl || '/api';
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const cleanPath = path.startsWith('/api') ? path.substring(4) : (path.startsWith('/') ? path : '/' + path);
    return `${cleanBase}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  }

  async ngOnInit() {
    try {
      const res = await fetch(this.getResolvedUrl('/api/shops/demo-shop-1/invoice-config'));
      if (res.ok) {
        const rawData = await res.json();
        const data = rawData && rawData.success && rawData.data !== undefined ? rawData.data : rawData;
        if (data) {
          if (data.company_name) this.companyName.set(data.company_name);
          if (data.company_address) this.companyAddress.set(data.company_address);
          if (data.notes_template) this.notesTemplate.set(data.notes_template);
        }
      }
    } catch (e) {
      console.error('Failed to load invoice config:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveConfig() {
    if (!this.authService.currentUser()) {
      this.showLoginModal.set(true);
      return;
    }
    this.isSaving.set(true);
    try {
      await fetch(this.getResolvedUrl('/api/shops/demo-shop-1/invoice-config'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: this.companyName(),
          company_address: this.companyAddress(),
          tax_rate: 0,
          notes_template: this.notesTemplate()
        })
      });
    } catch (e) {
      console.error('Failed to save invoice config:', e);
    } finally {
      this.isSaving.set(false);
    }
  }

  sendInvoice() {
    this.isSent.set(true);
    setTimeout(() => {
      this.isSent.set(false);
    }, 2000);
  }

  lineItems = signal([
    { name: 'Website Redesign', description: 'Homepage and 5 inner pages', quantity: 1, rate: 2500 }
  ]);

  subtotal = computed(() => {
    return this.lineItems().reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  });

  addLineItem() {
    this.lineItems.update(items => [...items, { name: '', description: '', quantity: 1, rate: 0 }]);
  }

  removeLineItem(index: number) {
    this.lineItems.update(items => items.filter((_, i) => i !== index));
  }
}
