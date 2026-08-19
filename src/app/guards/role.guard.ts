import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.model';

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
