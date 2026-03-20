import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(m => m.Home)
  },
  {
    path: 'themes',
    loadComponent: () => import('./themes/themes').then(m => m.Themes)
  },
  {
    path: 'preview/:id',
    loadComponent: () => import('./preview/preview').then(m => m.Preview)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart').then(m => m.Cart)
  },
  {
    path: 'demo/:type',
    loadComponent: () => import('./demo-explorer/demo-explorer').then(m => m.DemoExplorer)
  },
  {
    path: 'ai-generator',
    loadComponent: () => import('./ai-generator/ai-generator').then(m => m.AiGenerator)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.Admin),
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (auth.isAdmin()) return true;
      router.navigate(['/login']);
      return false;
    }]
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./my-orders/my-orders').then(m => m.MyOrders),
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (auth.user()) return true;
      router.navigate(['/login']);
      return false;
    }]
  },
  {
    path: 'invoice-saas',
    loadComponent: () => import('./invoice-landing/invoice-landing').then(m => m.InvoiceLandingComponent)
  },
  {
    path: 'shop-dashboard',
    loadComponent: () => import('./shop-dashboard/shop-dashboard').then(m => m.ShopDashboardComponent),
    canActivate: [() => {
      const auth = inject(AuthService);
      const router = inject(Router);
      if (auth.user()) return true;
      router.navigate(['/login']);
      return false;
    }],
    children: [
      { path: '', loadComponent: () => import('./shop-dashboard/shop-overview').then(m => m.ShopOverviewComponent) },
      { path: 'invoices', loadComponent: () => import('./shop-dashboard/shop-invoices').then(m => m.ShopInvoicesComponent) },
      { path: 'invoices/new', loadComponent: () => import('./shop-dashboard/invoice-generator').then(m => m.InvoiceGeneratorComponent) },
      { path: 'products', loadComponent: () => import('./shop-dashboard/shop-products').then(m => m.ShopProductsComponent) },
      { path: 'customers', loadComponent: () => import('./shop-dashboard/shop-customers').then(m => m.ShopCustomersComponent) },
      { path: 'settings', loadComponent: () => import('./shop-dashboard/shop-settings').then(m => m.ShopSettingsComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
