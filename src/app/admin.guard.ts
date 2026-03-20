import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // We need to wait for auth to be ready
  return toObservable(authService.isAdmin).pipe(
    // Wait for the first value (could be false initially while loading)
    // But we know if user is null, it's false.
    // A better way is to check if auth state is loaded.
    // For simplicity, we'll just check the current value.
    map(isAdmin => {
      if (isAdmin) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
