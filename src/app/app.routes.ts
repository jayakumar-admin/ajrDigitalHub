import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import { FormList } from './pages/form-list';
import { ResponseDashboard } from './pages/response-dashboard';
import { PublicForm } from './pages/public-form';
import { HomeComponent } from './pages/home/home';
import { MarketplaceComponent } from './pages/marketplace/marketplace';
import { MarketplacePreviewComponent } from './pages/marketplace-preview/marketplace-preview.component';
import { ServicesComponent } from './pages/services/services';
import { InvoiceBuilderComponent } from './pages/invoice-builder';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { AdminGuard } from './guards/admin.guard';

// Import Admin components
import { AdminComponent } from './pages/admin/admin';
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { MarketplaceConfigComponent } from './pages/admin/marketplace-config/marketplace-config.component';
import { SystemCoreComponent } from './pages/admin/system-core/system-core.component';
import { ProjectDetailComponent } from './pages/admin/project-detail/project-detail';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'admin-login', component: AdminLoginComponent },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/marketplace-config', 
    component: MarketplaceConfigComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/system-core', 
    component: SystemCoreComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/apps/:id', 
    component: ProjectDetailComponent,
    canActivate: [AdminGuard]
  },
  { path: 'home', component: HomeComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'marketplace/preview/:id', component: MarketplacePreviewComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'invoice-builder', component: InvoiceBuilderComponent },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'forms', pathMatch: 'full' },
      { path: 'forms', component: FormList },
      { path: 'forms/:id/responses', component: ResponseDashboard }
    ]
  },
  { path: 'form/:id', component: PublicForm },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
