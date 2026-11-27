import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const ROTAS_DE_AUTENTICACAO = new Set(['/api/auth/me', '/api/auth/login']);

export const authInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const auth = inject(AuthService);

  return proximo(requisicao).pipe(
    catchError((erro: unknown) => {
      if (
        erro instanceof HttpErrorResponse &&
        erro.status === 401 &&
        !ROTAS_DE_AUTENTICACAO.has(requisicao.url)
      ) {
        auth.limparSessao();
      }
      return throwError(() => erro);
    }),
  );
};
