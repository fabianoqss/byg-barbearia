import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { appConfig } from './app.config';
import { authGuard } from './core/auth/guards/auth.guard';
import { rotaAtualExigeAutenticacao } from './core/auth/guards/auth-guard.utils';
import { AuthService } from './core/auth/auth.service';
import { Login } from './features/auth/login/login';

const USUARIO_RESPONSE = {
  id: 17,
  nome: 'Fabiano',
  email: 'fabiano@example.com',
  papel: 'CLIENTE' as const,
};

describe('appConfig', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('carrega a sessão ao inicializar a aplicação', async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/me').flush(USUARIO_RESPONSE);
    await Promise.resolve();

    expect(auth.usuario()).toEqual(USUARIO_RESPONSE);
  });

  it('conclui a inicialização como visitante quando /me retorna 401', async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/auth/me')
      .flush({ title: 'Unauthorized', status: 401 }, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();

    expect(auth.usuario()).toBeNull();
    expect(auth.autenticado()).toBe(false);
  });

  it('inicializa como visitante quando /me retorna erro 500', async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/me').flush({}, { status: 500, statusText: 'Server Error' });
    await Promise.resolve();

    expect(auth.usuario()).toBeNull();
    expect(auth.autenticado()).toBe(false);
  });

  it('inicializa como visitante quando /me falha na rede', async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/auth/me').error(new ProgressEvent('error'));
    await Promise.resolve();

    expect(auth.usuario()).toBeNull();
    expect(auth.autenticado()).toBe(false);
  });

  it('anexa o token CSRF do cookie em requisições POST relativas', () => {
    const cookieOriginal = document.cookie;
    document.cookie = 'XSRF-TOKEN=token-csrf; path=/';
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const cliente = TestBed.inject(HttpClient);

    try {
      http.expectOne('/api/auth/me').flush(USUARIO_RESPONSE);
      auth
        .login({ username: 'fabiano@example.com', password: 'senha', rememberMe: false })
        .subscribe();
      const requisicao = http.expectOne('/api/auth/login');

      expect(requisicao.request.headers.get('X-XSRF-TOKEN')).toBe('token-csrf');
      requisicao.flush(USUARIO_RESPONSE);

      cliente.post('https://third-party.example/submit', {}).subscribe();
      const requisicaoExterna = http.expectOne('https://third-party.example/submit');
      expect(requisicaoExterna.request.headers.has('X-XSRF-TOKEN')).toBe(false);
      requisicaoExterna.flush({});

      cliente.post('//terceiro.example/submit', {}).subscribe();
      const requisicaoRelativaExterna = http.expectOne('//terceiro.example/submit');
      expect(requisicaoRelativaExterna.request.headers.has('X-XSRF-TOKEN')).toBe(false);
      requisicaoRelativaExterna.flush({});
    } finally {
      document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
      if (cookieOriginal) {
        document.cookie = cookieOriginal;
      }
    }
  });

  it('espera /me antes de liberar rota protegida e redireciona após expirar sessão', async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const rotaBase = router.config;
    router.resetConfig([
      ...rotaBase.slice(0, -1),
      { path: 'protegida', component: Login, canActivate: [authGuard] },
      rotaBase.at(-1)!,
    ]);

    let navegacaoConcluida = false;
    const navegacao = RouterTestingHarness.create('/protegida').then((harness) => {
      navegacaoConcluida = true;
      return harness;
    });
    await Promise.resolve();
    expect(navegacaoConcluida).toBe(false);

    http.expectOne('/api/auth/me').flush(USUARIO_RESPONSE);
    const harness = await navegacao;
    expect(router.url).toBe('/protegida');
    expect(rotaAtualExigeAutenticacao(router)).toBe(true);

    const cliente = TestBed.inject(HttpClient);
    const auth = TestBed.inject(AuthService);
    cliente.get('/api/privado').subscribe({ error: () => undefined });
    http
      .expectOne('/api/privado')
      .flush({ title: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.autenticado()).toBe(false);
    await vi.waitFor(() => expect(router.url).toBe('/login?returnUrl=%2Fprotegida'));
    await harness.fixture.whenStable();

    expect(router.url).toBe('/login?returnUrl=%2Fprotegida');

    cliente.get('/api/privado').subscribe({ error: () => undefined });
    http
      .expectOne('/api/privado')
      .flush({ title: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    await harness.fixture.whenStable();

    expect(router.url).toBe('/login?returnUrl=%2Fprotegida');
  });
});
