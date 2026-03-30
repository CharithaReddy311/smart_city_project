import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  const auth   = inject(AuthService);
  const router = inject(Router);
  const allowed: string[] = route.data['roles'];
  if (allowed.includes(auth.getRole() || '')) return true;
  router.navigate(['/login']);
  return false;
};