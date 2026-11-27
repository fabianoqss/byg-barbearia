import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { UsuarioResponse } from '../models/usuario-response';
import { Login } from './login';

describe('Login', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;
  let elemento: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([
          { path: '', component: Login },
          { path: 'login', component: Login },
          { path: 'agendar', component: Login },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create('/login');
    http = TestBed.inject(HttpTestingController);
    elemento = harness.routeNativeElement!;
  });

  afterEach(() => http.verify());

  function preencher(login: string, senha: string): void {
    const campoLogin = elemento.querySelector<HTMLInputElement>('#login')!;
    const campoSenha = elemento.querySelector<HTMLInputElement>('#senha')!;
    campoLogin.value = login;
    campoLogin.dispatchEvent(new Event('input'));
    campoSenha.value = senha;
    campoSenha.dispatchEvent(new Event('input'));
    harness.fixture.detectChanges();
  }

  it('envia credenciais e redireciona para returnUrl interno após login', async () => {
    await harness.navigateByUrl('/login?returnUrl=%2Fagendar');
    elemento = harness.routeNativeElement!;
    preencher('(83) 9 0000-0000', 'senha-segura');
    elemento.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    const requisicao = http.expectOne('/api/auth/login');
    expect(requisicao.request.body).toBe(
      'username=83900000000&password=senha-segura&remember-me=true',
    );
    requisicao.flush({
      id: 1,
      nome: 'Fabiano',
      email: 'fabiano@example.com',
      papel: 'CLIENTE',
    } satisfies UsuarioResponse);
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/agendar');
  });

  it('mostra erro genérico para credenciais recusadas', async () => {
    preencher('fabiano@example.com', 'senha-invalida');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    http
      .expectOne('/api/auth/login')
      .flush({ detail: 'Credenciais inválidas' }, { status: 401, statusText: 'Unauthorized' });
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(elemento.textContent).toContain('E-mail/telefone ou senha inválidos');
  });

  it('redireciona para a página inicial quando returnUrl não é interno', async () => {
    await harness.navigateByUrl('/login?returnUrl=%2F%2Fexterno.example');
    elemento = harness.routeNativeElement!;
    preencher('fabiano@example.com', 'senha-segura');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    http.expectOne('/api/auth/login').flush({
      id: 1,
      nome: 'Fabiano',
      email: 'fabiano@example.com',
      papel: 'CLIENTE',
    } satisfies UsuarioResponse);
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('desabilita o botão durante o envio', () => {
    preencher('fabiano@example.com', 'senha-segura');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    harness.fixture.detectChanges();

    expect(elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    http.expectOne('/api/auth/login').flush({
      id: 1,
      nome: 'Fabiano',
      email: 'fabiano@example.com',
      papel: 'CLIENTE',
    } satisfies UsuarioResponse);
  });

  it('aponta o login Google para o endpoint de autorização', () => {
    expect(
      elemento.querySelector<HTMLAnchorElement>('a[href="/oauth2/authorization/google"]'),
    ).not.toBeNull();
  });
});
