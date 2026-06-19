import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check JWT Token
  const hasToken = !!authService.accessToken();
  const user = authService.currentUser();

  // Check if role is admin
  if (hasToken && user && user.role === 'admin') {
    return true;
  }

  // Redirect to login if unauthorized
  return router.parseUrl('/login');
};
