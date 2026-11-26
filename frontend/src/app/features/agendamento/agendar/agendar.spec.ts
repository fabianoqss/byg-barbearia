import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { vi } from 'vitest';
import { appConfig } from '../../../app.config';

describe('Agendar', () => {
  let harness: RouterTestingHarness;
  let elemento: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date('2026-11-26T11:00:00Z'));
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => vi.useRealTimers());

  async function abrir(url = '/agendar'): Promise<void> {
    harness = await RouterTestingHarness.create(url);
    elemento = harness.routeNativeElement!;
  }

  function botao(seletor: string): HTMLButtonElement {
    return elemento.querySelector<HTMLButtonElement>(seletor)!;
  }

  async function clicar(seletor: string): Promise<void> {
    botao(seletor).click();
    await harness.fixture.whenStable();
  }

  function confirmar(): HTMLButtonElement {
    return botao('#confirmar-agendamento');
  }

  it('mostra os padrões e pede a seleção de um horário', async () => {
    await abrir();

    expect(elemento.querySelector('h1')?.textContent?.trim()).toBe('Agendar horário');
    expect(elemento.querySelector('header a')?.getAttribute('href')).toBe('/');
    expect(botao('#servico button[aria-pressed="true"]').textContent).toContain('Corte');
    expect(botao('#barbeiro button[aria-pressed="true"]').textContent).toContain('Qualquer');
    expect(botao('#dia button[aria-pressed="true"]').getAttribute('aria-label')).toContain(
      'quinta-feira, 26 de novembro',
    );
    expect(confirmar().disabled).toBe(true);
    expect(confirmar().textContent?.trim()).toBe('Escolha um horário');
  });

  it('preseleciona o serviço indicado na URL e usa o primeiro para um id desconhecido', async () => {
    await abrir('/agendar?servico=corte-barba');

    expect(botao('#servico button[aria-pressed="true"]').textContent).toContain('Corte + Barba');
    expect(elemento.querySelector('#horario button:last-child')?.textContent?.trim()).toBe('17:00');

    await harness.navigateByUrl('/agendar?servico=desconhecido');

    expect(botao('#servico button[aria-pressed="true"]').textContent).toMatch(/Corte\s*30 min/);
  });

  it('seleciona o próximo dia com horários quando o expediente de hoje acabou', async () => {
    vi.setSystemTime(new Date('2026-11-26T21:00:00Z'));
    await abrir();

    expect(botao('#dia button[aria-pressed="true"]').getAttribute('aria-label')).toContain(
      'sexta-feira, 27 de novembro',
    );
    expect(elemento.querySelectorAll('#dia button')).toHaveLength(6);
  });

  it('habilita a confirmação e atualiza o resumo ao selecionar barbeiro e horário', async () => {
    await abrir();
    await clicar('#barbeiro button:nth-child(3)');
    await clicar('#horario button:first-child');

    expect(botao('#barbeiro button[aria-pressed="true"]').textContent).toContain('Gabriel Black');
    expect(elemento.querySelector('[aria-live="polite"]')?.textContent).toMatch(
      /Gabriel Black[\s\S]*09:00/,
    );
    expect(confirmar().disabled).toBe(false);
    expect(confirmar().textContent?.trim()).toBe('Confirmar agendamento');
  });

  it('preserva um horário válido ao trocar de serviço e limpa um horário que deixou de caber', async () => {
    await abrir();
    await clicar('#horario button:last-child');
    await clicar('#servico button:nth-child(2)');

    expect(botao('#horario button[aria-pressed="true"]').textContent?.trim()).toBe('17:30');
    expect(confirmar().disabled).toBe(false);

    await clicar('#servico button:nth-child(3)');

    expect(elemento.querySelector('#horario button[aria-pressed="true"]')).toBeNull();
    expect(confirmar().disabled).toBe(true);
  });

  it('pede nova escolha de horário ao trocar o dia', async () => {
    await abrir();
    await clicar('#horario button:first-child');
    await clicar('#dia button:nth-child(2)');

    expect(elemento.querySelector('#horario button[aria-pressed="true"]')).toBeNull();
    expect(elemento.querySelector('[aria-live="polite"]')?.textContent).toContain('Sex 27');
    expect(confirmar().disabled).toBe(true);
  });

  it('retira um horário selecionado assim que ele passa', async () => {
    vi.setSystemTime(new Date('2026-11-26T12:59:50Z'));
    await abrir();
    await clicar('#horario button:first-child');
    expect(botao('#horario button[aria-pressed="true"]').textContent?.trim()).toBe('10:00');

    vi.advanceTimersByTime(10_001);
    await harness.fixture.whenStable();

    expect(botao('#horario button:first-child').textContent?.trim()).toBe('10:30');
    expect(confirmar().disabled).toBe(true);
  });
});
