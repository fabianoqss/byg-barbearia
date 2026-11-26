import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let elemento: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    elemento = fixture.nativeElement;
    await fixture.whenStable();
  });

  function campo(id: string): HTMLInputElement {
    return elemento.querySelector<HTMLInputElement>(`#${id}`)!;
  }

  function botao(seletor: string): HTMLButtonElement {
    return elemento.querySelector<HTMLButtonElement>(seletor)!;
  }

  async function preencher(id: string, valor: string): Promise<void> {
    const input = campo(id);
    input.value = valor;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  }

  async function enviar(): Promise<void> {
    botao('button[type="submit"]').click();
    await fixture.whenStable();
  }

  it('alterna a visibilidade da senha', async () => {
    const alternar = botao('button[aria-pressed]');
    expect(campo('senha').type).toBe('password');
    expect(alternar.getAttribute('aria-label')).toBe('Mostrar senha');

    alternar.click();
    await fixture.whenStable();

    expect(campo('senha').type).toBe('text');
    expect(alternar.getAttribute('aria-label')).toBe('Ocultar senha');
    expect(alternar.getAttribute('aria-pressed')).toBe('true');
  });

  it('mostra os campos obrigatórios ao enviar vazio', async () => {
    await enviar();

    expect(elemento.querySelector('#login-erro')?.textContent).toContain(
      'Informe seu e-mail ou telefone.',
    );
    expect(elemento.querySelector('#senha-erro')?.textContent).toContain('Informe sua senha.');
    expect(campo('login').getAttribute('aria-invalid')).toBe('true');
    expect(campo('login').getAttribute('aria-describedby')).toBe('login-erro');
  });

  it('rejeita login que não é e-mail nem telefone', async () => {
    await preencher('login', 'cliente');

    expect(elemento.querySelector('#login-erro')?.textContent).toContain(
      'Informe um e-mail ou telefone válido.',
    );
  });

  it('não mostra erros quando o formulário é válido', async () => {
    await preencher('login', '(83) 9 0000-0000');
    await preencher('senha', 'segredo123');
    await enviar();

    expect(elemento.querySelector('#login-erro')).toBeNull();
    expect(elemento.querySelector('#senha-erro')).toBeNull();
    expect(campo('login').getAttribute('aria-invalid')).toBe('false');
  });
});
