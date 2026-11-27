import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const ROTAS_DE_AUTENTICACAO = new Set(['/api/auth/me', '/api/auth/login']);

export const authInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const auth = inject(AuthService);
  const caminho = new URL(requisicao.urlWithParams, 'https://byg.invalid').pathname;
  const chamadaDaApi = requisicao.url.startsWith('/api/');

  return proximo(requisicao).pipe(
    catchError((erro: unknown) => {
      if (
        erro instanceof HttpErrorResponse &&
        erro.status === 401 &&
        chamadaDaApi &&
        !ROTAS_DE_AUTENTICACAO.has(caminho)
      ) {
        auth.limparSessao();
      }
      return throwError(() => erro);
    }),
  );
};
