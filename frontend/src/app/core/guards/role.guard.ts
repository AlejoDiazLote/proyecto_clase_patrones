import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/auth/login']);
    }

    const rol = auth.currentUser?.rol ?? '';
    if (!allowedRoles.includes(rol)) {
      return router.createUrlTree(['/events']);
    }

    return true;
  };
}
