import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import { FormList } from './pages/form-list';
import { ResponseDashboard } from './pages/response-dashboard';
import { PublicForm } from './pages/public-form';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'forms', pathMatch: 'full' },
      { path: 'forms', component: FormList },
      { path: 'forms/:id/responses', component: ResponseDashboard }
    ]
  },
  { path: 'form/:id', component: PublicForm },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
