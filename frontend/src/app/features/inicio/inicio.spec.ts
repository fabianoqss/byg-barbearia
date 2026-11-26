import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from '../../app.config';

describe('Inicio', () => {
  let harness: RouterTestingHarness;
  let elemento: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
    harness = await RouterTestingHarness.create('/');
    elemento = harness.routeNativeElement!;
  });

  it('exibe o catálogo e a equipe da barbearia', () => {
    expect(elemento.querySelector('h1')?.textContent).toMatch(/Seu estilo\s*começa aqui\./);
    const servicos = elemento.querySelectorAll('#servicos article');

    expect(servicos).toHaveLength(3);
    expect(servicos[0].textContent).toMatch(/30 min\s*·\s*R\$\s*40/);
    expect(servicos[2].textContent).toMatch(/1 h\s*·\s*R\$\s*80/);
    expect(elemento.querySelector('#equipe')?.textContent).toContain('Gabriel Martins');
  });

  it('navega para as seções e oferece acesso ao login', () => {
    const links = Array.from(elemento.querySelectorAll('nav a'));

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/#servicos',
      '/#equipe',
      '/#contato',
      '/login',
      '/agendar',
    ]);
  });

  it('permite transferir o foco para os destinos das âncoras', () => {
    for (const id of ['topo', 'servicos', 'equipe', 'contato']) {
      const secao = elemento.querySelector<HTMLElement>(`#${id}`)!;
      secao.focus();
      expect(document.activeElement).toBe(secao);
    }
  });

  it('leva o serviço escolhido para o agendamento', async () => {
    const agendar = elemento.querySelector<HTMLAnchorElement>(
      '#servicos a[href*="servico=barba"]',
    )!;

    agendar.click();
    await harness.fixture.whenStable();

    expect(
      harness.routeNativeElement?.querySelector('#servico button[aria-pressed="true"]')
        ?.textContent,
    ).toContain('Barba');
  });

  it('abre a página inicial por uma rota desconhecida', async () => {
    await harness.navigateByUrl('/rota-inexistente');

    expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('byg-inicio');
  });
});
