import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  inject,
} from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([authInterceptor]),
    ),
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(auth.carregarSessao().pipe(catchError(() => of(null))));
    }),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          let origem: typeof from | null = from;
          let destino: typeof to | null = to;
          let mesmaRota = true;

          while (origem && destino) {
            const destinoAtual = destino;
            mesmaRota &&=
              origem.routeConfig === destinoAtual.routeConfig &&
              origem.url.length === destinoAtual.url.length &&
              origem.url.every(
                (segmento, indice) => segmento.toString() === destinoAtual.url[indice].toString(),
              );
            origem = origem.firstChild;
            destino = destino.firstChild;
          }

          mesmaRota &&= origem === null && destino === null;
          mesmaRota &&=
            JSON.stringify(from.params) === JSON.stringify(to.params) &&
            JSON.stringify(from.queryParams) === JSON.stringify(to.queryParams);

          if (mesmaRota && from.fragment !== to.fragment) {
            transition.skipTransition();
          }
        },
      }),
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
};
