import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const message = error.error?.message || 'Something went wrong. Please try again.';

      if (error.status === 401) {
        localStorage.removeItem('ep_token');
        localStorage.removeItem('ep_user');
        router.navigate(['/login']);
        toast.error('Session expired. Please login again.');
      } else if (error.status === 403) {
        toast.error('Access denied.');
      } else if (error.status === 0) {
        toast.error('Cannot connect to server. Please check your connection.');
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later.');
      }

      return throwError(() => error);
    })
  );
};
