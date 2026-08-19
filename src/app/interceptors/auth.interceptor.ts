import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const authHeader = auth.getAuthHeader();

  const authorizedReq = authHeader
    ? req.clone({ setHeaders: { Authorization: authHeader } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        router.navigate(['/access-denied']);
      }

      return throwError(() => error);
    })
  );
};
