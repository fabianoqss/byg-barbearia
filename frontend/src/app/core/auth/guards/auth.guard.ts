import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { urlDeLogin } from './auth-guard.utils';

export const authGuard: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.autenticado() ? true : urlDeLogin(router, estado);
};
