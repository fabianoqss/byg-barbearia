import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { UsuarioResponse } from '../../../core/auth/models/usuario-response';
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
    preencher('  FABIANO@EXAMPLE.COM  ', 'senha-segura');
    elemento.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();

    const requisicao = http.expectOne('/api/auth/login');
    expect(requisicao.request.body).toBe(
      'username=fabiano%40example.com&password=senha-segura&remember-me=true',
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

  it('alterna a visibilidade da senha', () => {
    const campoSenha = elemento.querySelector<HTMLInputElement>('#senha')!;
    elemento.querySelector<HTMLButtonElement>('button[aria-label="Mostrar senha"]')!.click();
    harness.fixture.detectChanges();

    expect(campoSenha.type).toBe('text');
    elemento.querySelector<HTMLButtonElement>('button[aria-label="Ocultar senha"]')!.click();
    harness.fixture.detectChanges();

    expect(campoSenha.type).toBe('password');
  });

  it('exibe validação quando os campos obrigatórios estão vazios', () => {
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    harness.fixture.detectChanges();

    expect(elemento.textContent).toContain('Informe seu e-mail ou telefone.');
    expect(elemento.textContent).toContain('Informe sua senha.');
    http.expectNone('/api/auth/login');
  });

  it('rejeita login inválido sem enviar a requisição', () => {
    preencher('email-invalido', 'senha-segura');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    harness.fixture.detectChanges();

    expect(elemento.textContent).toContain('Informe um e-mail ou telefone válido.');
    http.expectNone('/api/auth/login');
  });

  it('não mostra erros de validação para credenciais válidas', () => {
    preencher('(83) 9 0000-0000', 'senha-segura');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    harness.fixture.detectChanges();

    expect(elemento.textContent).not.toContain('Informe seu e-mail ou telefone.');
    expect(elemento.textContent).not.toContain('Informe um e-mail ou telefone válido.');
    expect(elemento.textContent).not.toContain('Informe sua senha.');
    http.expectOne('/api/auth/login').flush({
      id: 1,
      nome: 'Fabiano',
      email: 'fabiano@example.com',
      papel: 'CLIENTE',
    } satisfies UsuarioResponse);
  });

  it('ignora submissões duplicadas enquanto o login está carregando', () => {
    preencher('fabiano@example.com', 'senha-segura');
    const formulario = elemento.querySelector<HTMLFormElement>('form')!;
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const requisicoes = http.match('/api/auth/login');
    expect(requisicoes).toHaveLength(1);
    requisicoes[0].flush({
      id: 1,
      nome: 'Fabiano',
      email: 'fabiano@example.com',
      papel: 'CLIENTE',
    } satisfies UsuarioResponse);
  });

  it('mostra mensagem genérica para falha de servidor ou rede', async () => {
    preencher('fabiano@example.com', 'senha-segura');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    http.expectOne('/api/auth/login').flush({}, { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(elemento.textContent).toContain('Não foi possível entrar no momento. Tente novamente.');
    expect(elemento.textContent).not.toContain('E-mail/telefone ou senha inválidos');
  });

  it('mostra mensagem genérica quando a requisição falha na rede', async () => {
    preencher('fabiano@example.com', 'senha-segura');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    http.expectOne('/api/auth/login').error(new ProgressEvent('error'));
    await harness.fixture.whenStable();
    harness.fixture.detectChanges();

    expect(elemento.textContent).toContain('Não foi possível entrar no momento. Tente novamente.');
    expect(elemento.textContent).not.toContain('E-mail/telefone ou senha inválidos');
  });

  it('cancela a requisição de login ao destruir o componente', async () => {
    preencher('fabiano@example.com', 'senha-segura');
    elemento.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    const requisicao = http.expectOne('/api/auth/login');

    await harness.navigateByUrl('/agendar');

    expect(requisicao.cancelled).toBe(true);
  });
});
