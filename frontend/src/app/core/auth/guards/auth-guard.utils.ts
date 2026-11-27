import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

const GUARDS_COM_AUTENTICACAO = new WeakSet<CanActivateFn>();

export function marcarGuardDeAutenticacao(guard: CanActivateFn): CanActivateFn {
  GUARDS_COM_AUTENTICACAO.add(guard);
  return guard;
}

export function rotaAtualExigeAutenticacao(router: Router): boolean {
  const snapshotExigeAutenticacao = (snapshot: ActivatedRouteSnapshot): boolean => {
    const guards = [
      ...(snapshot.routeConfig?.canActivate ?? []),
      ...(snapshot.routeConfig?.canActivateChild ?? []),
    ];

    return (
      guards.some(
        (guard) =>
          typeof guard === 'function' && GUARDS_COM_AUTENTICACAO.has(guard as CanActivateFn),
      ) || snapshot.children.some((filho) => snapshotExigeAutenticacao(filho))
    );
  };

  return snapshotExigeAutenticacao(router.routerState.snapshot.root);
}

export function urlDeLogin(router: Router, estado: RouterStateSnapshot): UrlTree {
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
}
