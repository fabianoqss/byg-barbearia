import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

const USUARIO_RESPONSE = {
  id: 17,
  nome: 'Fabiano',
  email: 'fabiano@example.com',
  papel: 'CLIENTE' as const,
};

describe('authInterceptor', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let cliente: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        AuthService,
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    cliente = TestBed.inject(HttpClient);
  });

  afterEach(() => http.verify());

  it('limpa a sessão em 401 de recursos, preservando erros de login e sessão', () => {
    auth
      .login({ username: 'fabiano@example.com', password: 'senha', rememberMe: false })
      .subscribe();
    http.expectOne('/api/auth/login').flush(USUARIO_RESPONSE);

    cliente.get('/api/auth/me').subscribe({ error: () => undefined });
    http
      .expectOne('/api/auth/me')
      .flush({ title: 'Unauthorized', status: 401 }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.autenticado()).toBe(true);

    cliente.post('/api/auth/login', 'username=x').subscribe({ error: () => undefined });
    http
      .expectOne('/api/auth/login')
      .flush({ title: 'Unauthorized', status: 401 }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.autenticado()).toBe(true);

    cliente.get('/api/agendamentos').subscribe({ error: () => undefined });
    http
      .expectOne('/api/agendamentos')
      .flush({ title: 'Unauthorized', status: 401 }, { status: 401, statusText: 'Unauthorized' });

    expect(auth.usuario()).toBeNull();
    expect(auth.autenticado()).toBe(false);
  });
});
