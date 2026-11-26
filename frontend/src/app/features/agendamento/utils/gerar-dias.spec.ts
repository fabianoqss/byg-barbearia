import { gerarDias } from './gerar-dias';

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
});
