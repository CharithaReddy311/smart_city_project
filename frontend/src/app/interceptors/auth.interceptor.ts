import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Auth endpoints are public and should not carry stale tokens.
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  return next(req);
};