import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Papel } from '../../../shared/models/usuario';
import { AuthService } from '../auth.service';
import { urlDeLogin } from './auth-guard.utils';

export function papelGuard(papelEsperado: Papel): CanActivateFn {
  return (_rota, estado) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.autenticado()) {
      return urlDeLogin(router, estado);
    }

    return auth.papel() === papelEsperado ? true : router.createUrlTree(['/']);
  };
}
