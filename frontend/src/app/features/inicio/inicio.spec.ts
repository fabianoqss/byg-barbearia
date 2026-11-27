import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
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

  it('rola novamente para todas as seções quando o fragmento já está ativo', async () => {
    for (const fragmento of ['topo', 'servicos', 'equipe', 'contato']) {
      const secao = elemento.querySelector<HTMLElement>(`#${fragmento}`)!;
      const rolar = vi.fn();
      Object.defineProperty(secao, 'scrollIntoView', { configurable: true, value: rolar });
      const link = elemento.querySelector<HTMLAnchorElement>(`a[href="/#${fragmento}"]`)!;

      link.click();
      await harness.fixture.whenStable();
      link.click();
      await harness.fixture.whenStable();

      expect(rolar).toHaveBeenCalledOnce();
      expect(rolar).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    }
  });

  it('usa transição de visual ao navegar para login e agendamento', async () => {
    const descritorOriginal = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
    const skipTransition = vi.fn();
    const startViewTransition = vi.fn((atualizar: () => Promise<void>) => {
      const concluida = Promise.resolve().then(atualizar);
      return {
        updateCallbackDone: concluida,
        ready: concluida,
        finished: concluida,
        types: new Set() as ViewTransitionTypeSet,
        skipTransition,
      } as ViewTransition;
    });
    try {
      Object.defineProperty(document, 'startViewTransition', {
        configurable: true,
        value: startViewTransition,
      });

      elemento.querySelector<HTMLAnchorElement>('nav a[href="/#servicos"]')!.click();
      await harness.fixture.whenStable();

      expect(startViewTransition).toHaveBeenCalledOnce();
      expect(skipTransition).toHaveBeenCalledOnce();

      elemento.querySelector<HTMLAnchorElement>('nav a[href="/login"]')!.click();
      await harness.fixture.whenStable();

      expect(startViewTransition).toHaveBeenCalledTimes(2);
      expect(skipTransition).toHaveBeenCalledOnce();
      expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('byg-login');

      await harness.navigateByUrl('/');
      elemento = harness.routeNativeElement!;
      elemento.querySelector<HTMLAnchorElement>('nav a[href="/agendar"]')!.click();
      await harness.fixture.whenStable();

      expect(startViewTransition).toHaveBeenCalledTimes(4);
      expect(skipTransition).toHaveBeenCalledOnce();
      expect(harness.routeNativeElement?.tagName.toLowerCase()).toBe('byg-agendar');
    } finally {
      if (descritorOriginal) {
        Object.defineProperty(document, 'startViewTransition', descritorOriginal);
      } else {
        Reflect.deleteProperty(document, 'startViewTransition');
      }
    }
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
