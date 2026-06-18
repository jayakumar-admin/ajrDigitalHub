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

export const routes: Routes = [
  { path: 'login', component: Login },
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
