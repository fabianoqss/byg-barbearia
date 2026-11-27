import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { rotaAtualExigeAutenticacao, urlDeLogin } from './guards/auth-guard.utils';

const ROTAS_DE_AUTENTICACAO = new Set(['/api/auth/me', '/api/auth/login']);

export const authInterceptor: HttpInterceptorFn = (requisicao, proximo) => {
  const auth = inject(AuthService);
  const router = inject(Router);
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
        const caminhoAtual = router.url.split(/[?#]/u, 1)[0];
        if (rotaAtualExigeAutenticacao(router) && caminhoAtual !== '/login') {
          void router.navigateByUrl(urlDeLogin(router, router.routerState.snapshot));
        }
      }
      return throwError(() => erro);
    }),
  );
};
