import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
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
