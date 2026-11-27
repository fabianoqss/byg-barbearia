import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { marcarGuardDeAutenticacao, urlDeLogin } from './auth-guard.utils';

export const authGuard: CanActivateFn = marcarGuardDeAutenticacao((_rota, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.autenticado() ? true : urlDeLogin(router, estado);
});
