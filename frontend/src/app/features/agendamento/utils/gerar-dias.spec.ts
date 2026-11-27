import { criarDiaAgendamento, gerarDias } from './gerar-dias';

describe('gerarDias', () => {
  it('retorna seis dias de funcionamento a partir de hoje, pulando o domingo', () => {
    const dias = gerarDias(new Date('2026-11-28T12:00:00Z'));

    expect(dias.map(({ data }) => data)).toEqual([
      '2026-11-28',
      '2026-11-30',
      '2026-12-01',
      '2026-12-02',
      '2026-12-03',
      '2026-12-04',
    ]);
    expect(dias[0]).toMatchObject({ semana: 'Sáb', numero: '28' });
  });

  it('usa a data de João Pessoa quando o dia UTC já mudou', () => {
    const dias = gerarDias(new Date('2026-11-29T01:00:00Z'));

    expect(dias[0].data).toBe('2026-11-28');
  });

  it('começa na segunda-feira quando hoje é domingo', () => {
    const dias = gerarDias(new Date('2026-11-29T15:00:00Z'));

    expect(dias[0]).toMatchObject({ semana: 'Seg', numero: '30' });
  });

  it('cria datas futuras em outro mês e ano com o resumo completo', () => {
    const dia = criarDiaAgendamento('2027-01-04', new Date('2026-11-26T11:00:00Z'));

    expect(dia).toMatchObject({
      data: '2027-01-04',
      semana: 'Seg',
      numero: '04',
      rotuloCompleto: 'segunda-feira, 4 de janeiro de 2027',
      expediente: { inicio: '09:00', fim: '18:00' },
    });
  });

  it('rejeita datas anteriores ao dia atual de João Pessoa', () => {
    const agora = new Date('2026-11-27T01:00:00Z');

    expect(criarDiaAgendamento('2026-11-26', agora)?.data).toBe('2026-11-26');
    expect(criarDiaAgendamento('2026-11-25', agora)).toBeNull();
  });

  it('rejeita datas inválidas ou malformadas', () => {
    const agora = new Date('2026-11-26T11:00:00Z');

    expect(criarDiaAgendamento('2026-02-30', agora)).toBeNull();
    expect(criarDiaAgendamento('', agora)).toBeNull();
    expect(criarDiaAgendamento('invalida', agora)).toBeNull();
  });

  it('mantém domingos selecionáveis sem expediente', () => {
    expect(criarDiaAgendamento('2026-11-29', new Date('2026-11-26T11:00:00Z'))).toMatchObject({
      data: '2026-11-29',
      semana: 'Dom',
      expediente: null,
    });
  });
});
