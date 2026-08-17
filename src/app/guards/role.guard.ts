import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

// Reads the allowed roles from route data, e.g.:
// { path: 'courses/new', canActivate: [roleGuard], data: { roles: ['ROLE_ADMIN'] } }
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = (route.data['roles'] as Role[]) ?? [];

  if (auth.hasRole(...allowedRoles)) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
