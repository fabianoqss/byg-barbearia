import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

const USUARIO_RESPONSE = {
  id: 17,
  nome: 'Fabiano',
  email: 'fabiano@example.com',
  papel: 'CLIENTE' as const,
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envia login urlencoded, mantém a sessão e envia remember-me=true', () => {
    let usuarioRecebido;
    service
      .login({ username: 'fabiano@example.com', password: 'p@ss +/ç', rememberMe: true })
      .subscribe((usuario) => (usuarioRecebido = usuario));

    const requisicao = http.expectOne('/api/auth/login');
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.headers.get('Content-Type')).toBe(
      'application/x-www-form-urlencoded',
    );
    expect(new URLSearchParams(requisicao.request.body)).toEqual(
      new URLSearchParams({
        username: 'fabiano@example.com',
        password: 'p@ss +/ç',
        'remember-me': 'true',
      }),
    );

    requisicao.flush(USUARIO_RESPONSE);

    expect(usuarioRecebido).toEqual(USUARIO_RESPONSE);
    expect(service.usuario()).toEqual(USUARIO_RESPONSE);
    expect(service.autenticado()).toBe(true);
    expect(service.papel()).toBe('CLIENTE');
  });

  it('envia remember-me=false quando não deve manter a sessão', () => {
    service.login({ username: '83999999999', password: 'senha', rememberMe: false }).subscribe();

    const requisicao = http.expectOne('/api/auth/login');
    expect(new URLSearchParams(requisicao.request.body).get('remember-me')).toBe('false');
    requisicao.flush(USUARIO_RESPONSE);
  });

  it('propaga 401 no login sem guardar usuário', () => {
    let status = 0;
    service
      .login({ username: 'fabiano@example.com', password: 'incorreta', rememberMe: false })
      .subscribe({ error: (erro: { status: number }) => (status = erro.status) });

    http
      .expectOne('/api/auth/login')
      .flush({ title: 'Unauthorized', status: 401 }, { status: 401, statusText: 'Unauthorized' });

    expect(status).toBe(401);
    expect(service.usuario()).toBeNull();
  });

  it('carrega uma sessão existente por /api/auth/me', () => {
    let usuarioRecebido;
    service.carregarSessao().subscribe((usuario) => (usuarioRecebido = usuario));

    http.expectOne('/api/auth/me').flush(USUARIO_RESPONSE);

    expect(usuarioRecebido).toEqual(USUARIO_RESPONSE);
    expect(service.autenticado()).toBe(true);
  });

  it('trata 401 da sessão como visitante sem propagar erro', () => {
    let resultado: unknown = 'pendente';
    service.carregarSessao().subscribe((usuario) => (resultado = usuario));

    http
      .expectOne('/api/auth/me')
      .flush({ title: 'Unauthorized', status: 401 }, { status: 401, statusText: 'Unauthorized' });

    expect(resultado).toBeNull();
    expect(service.autenticado()).toBe(false);
  });

  it('encerra a sessão e limpa o usuário após logout 204', () => {
    service
      .login({ username: 'fabiano@example.com', password: 'senha', rememberMe: false })
      .subscribe();
    http.expectOne('/api/auth/login').flush(USUARIO_RESPONSE);
    service.logout().subscribe();

    const requisicao = http.expectOne('/api/auth/logout');
    expect(requisicao.request.method).toBe('POST');
    requisicao.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.usuario()).toBeNull();
    expect(service.autenticado()).toBe(false);
    expect(service.papel()).toBeNull();
  });
});
