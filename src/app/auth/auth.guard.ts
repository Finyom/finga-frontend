import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from './services/auth';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Prüfen, ob der Benutzer angemeldet ist
  if (authService.isLoggedIn()) {
    return true;
  }

  // Gast:
  // Nur öffentliche Seiten dürfen besucht werden.
  const publicRoutes = [
    '/shops',
    '/products'
  ];

  const isPublicRoute = publicRoutes.some(
    routePath =>
      state.url === routePath ||
      state.url.startsWith(routePath + '/')
  );

  if (isPublicRoute) {
    return true;
  }

  // Nicht angemeldet und geschützte Seite:
  // Zur Login-Seite weiterleiten.
  return router.createUrlTree(
    ['/login'],
    {
      queryParams: {
        returnUrl: state.url
      }
    }
  );
};

