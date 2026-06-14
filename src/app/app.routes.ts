import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'marketplace',
    loadComponent: () => import('./pages/marketplace/marketplace').then(m => m.MarketplaceComponent)
  },
  {
    path: 'seller',
    loadComponent: () => import('./pages/seller/seller').then(m => m.SellerPortalComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then(m => m.ServicesComponent)
  },
  {
    path: 'invoice-builder',
    loadComponent: () => import('./pages/invoice-builder').then(m => m.InvoiceBuilderComponent)
  },
  {
    path: 'themes',
    loadComponent: () => import('./pages/themes/themes').then(m => m.ThemesComponent)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./pages/admin-login/admin-login').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/apps/:appId',
    loadComponent: () => import('./pages/admin/project-detail/project-detail').then(m => m.ProjectDetailComponent)
  },
  {
    path: 'admin/system-core',
    loadComponent: () => import('./pages/admin/system-core/system-core.component').then(m => m.SystemCoreComponent)
  },
  {
    path: 'admin/marketplace-config',
    loadComponent: () => import('./pages/admin/marketplace-config/marketplace-config.component').then(m => m.MarketplaceConfigComponent)
  },
  {
    path: 'marketplace/preview/:id',
    loadComponent: () => import('./pages/marketplace-preview/marketplace-preview.component').then(m => m.MarketplacePreviewComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(m => m.AdminComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
