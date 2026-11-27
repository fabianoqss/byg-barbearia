import { Router, RouterStateSnapshot, UrlTree } from '@angular/router';

export function urlDeLogin(router: Router, estado: RouterStateSnapshot): UrlTree {
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: estado.url } });
}
