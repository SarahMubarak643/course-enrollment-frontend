import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// One interceptor for the whole app: attaches the Authorization header
// to every request, and reacts to 401/403 by redirecting. 400/404/409
// are left for each component to display next to the form/list, using
// the message the backend already returned (see ApiError model).
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

      // 400 / 404 / 409: re-thrown as-is so the calling component can
      // read error.error.error (or field errors) and show the
      // backend's actual message.
      return throwError(() => error);
    })
  );
};
