import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from '../auth.service';
import { authGuard } from './auth.guard';
import { papelGuard } from './papel.guard';

function configurarAutenticacao(
  autenticado: boolean,
  papel: 'CLIENTE' | 'BARBEIRO' | null,
): Router {
  const auth = {
    autenticado: vi.fn(() => autenticado),
    papel: vi.fn(() => papel),
  } as unknown as AuthService;
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
  });
  return TestBed.inject(Router);
}

function avaliar(guard: typeof authGuard, url: string): boolean | UrlTree {
  return TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  ) as boolean | UrlTree;
}

describe('guards de autenticação', () => {
  it('redireciona visitantes para login preservando a rota solicitada', () => {
    const router = configurarAutenticacao(false, null);
    const resultado = avaliar(authGuard, '/barbeiro/agenda?dia=hoje');

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado as UrlTree)).toBe(
      '/login?returnUrl=%2Fbarbeiro%2Fagenda%3Fdia%3Dhoje',
    );
  });

  it('libera usuário autenticado', () => {
    configurarAutenticacao(true, 'CLIENTE');

    expect(avaliar(authGuard, '/agendar')).toBe(true);
  });

  it('envia visitantes a login ao exigir papel e preserva a rota', () => {
    const router = configurarAutenticacao(false, null);
    const resultado = avaliar(papelGuard('BARBEIRO'), '/barbeiro/agenda');

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/login?returnUrl=%2Fbarbeiro%2Fagenda');
  });

  it('permite o papel exigido', () => {
    configurarAutenticacao(true, 'BARBEIRO');
    expect(avaliar(papelGuard('BARBEIRO'), '/barbeiro/agenda')).toBe(true);
  });

  it('redireciona papel incompatível para a página inicial', () => {
    const router = configurarAutenticacao(true, 'CLIENTE');
    const resultado = avaliar(papelGuard('BARBEIRO'), '/barbeiro/agenda');

    expect(router.serializeUrl(resultado as UrlTree)).toBe('/');
  });
});
