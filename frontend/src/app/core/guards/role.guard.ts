import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const user = authService.currentUser();

  if (authService.isAuthenticated() && user && user.role === expectedRole) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
