import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { AuthService } from './core/auth/auth.service';

const USUARIO_RESPONSE = {
  id: 17,
  nome: 'Fabiano',
  email: 'fabiano@example.com',
  papel: 'CLIENTE' as const,
};

describe('appConfig', () => {
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
    } finally {
      document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
      if (cookieOriginal) {
        document.cookie = cookieOriginal;
      }
    }
  });
});
