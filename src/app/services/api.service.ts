import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LandingConfigType } from '../pages/home/home';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Landing Page
  getLandingConfig() {
    return this.http.get<LandingConfigType>('/api/settings/landing_config');
  }

  saveLandingConfig(config: LandingConfigType | null) {
    return this.http.put('/api/admin/settings/landing_config', config);
  }

  // Marketplace
  getProducts(category?: string, search?: string) {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (search) params = params.set('search', search);
    return this.http.get<Product[]>('/api/marketplace/products', { params });
  }

  purchaseProduct(productId: number, amount: number) {
    return this.http.post('/api/marketplace/purchase', { productId, amount });
  }

  // Client Dashboard
  getClientOrders() {
    return this.http.get<unknown[]>('/api/client/orders');
  }

  getClientTickets() {
    return this.http.get<unknown[]>('/api/client/tickets');
  }

  getKanban() {
    return this.http.get<unknown[]>('/api/client/kanban');
  }

  updateTaskStatus(id: number, status: string) {
    return this.http.put(`/api/client/kanban/${id}`, { status });
  }

  // Seller
  createSellerProduct(product: Partial<Product>) {
    return this.http.post('/api/seller/products', product);
  }

  // Admin SaaS
  getApps() {
    return this.http.get<unknown[]>('/api/admin/apps');
  }

  getPlans() {
    return this.http.get<unknown[]>('/api/admin/plans');
  }

  getAnalytics(appId?: number, daysRange = 7) {
    let params = new HttpParams().set('daysRange', daysRange.toString());
    if (appId) params = params.set('appId', appId.toString());
    return this.http.get<unknown>('/api/admin/analytics', { params });
  }

  getUsageLogs(appId: number) {
    return this.http.get<unknown[]>(`/api/admin/apps/${appId}/usage-logs`);
  }

  getWhatsappLogs(appId: number) {
    return this.http.get<unknown[]>(`/api/admin/apps/${appId}/whatsapp-logs`);
  }

  // HTML Builder
  getTemplates(appId: number) {
    return this.http.get<unknown[]>(`/api/admin/apps/${appId}/html-templates`);
  }

  saveTemplate(appId: number, template: unknown) {
    return this.http.post(`/api/admin/apps/${appId}/html-templates`, template);
  }

  publishTemplate(appId: number, id: number) {
    return this.http.post(`/api/admin/apps/${appId}/html-templates/${id}/publish`, {});
  }

  // --- Dynamic Global Menus ---
  getMenus() {
    return this.http.get<any[]>('/api/menus');
  }

  createAdminMenu(menuItem: any) {
    return this.http.post('/api/admin/menus', menuItem);
  }

  updateAdminMenu(id: number, menuItem: any) {
    return this.http.put(`/api/admin/menus/${id}`, menuItem);
  }

  deleteAdminMenu(id: number) {
    return this.http.delete(`/api/admin/menus/${id}`);
  }

  // --- Dynamic Categories ---
  getHttpCategories() {
    return this.http.get<any[]>('/api/categories');
  }

  createAdminCategory(category: any) {
    return this.http.post('/api/admin/categories', category);
  }

  // --- Custom Pages ---
  getPage(slug: string) {
    return this.http.get<any>(`/api/pages/${slug}`);
  }

  getPagesSettings() {
    return this.http.get<any[]>('/api/settings/pages');
  }

  savePageSettings(page: any) {
    return this.http.post('/api/admin/pages', page);
  }
}
