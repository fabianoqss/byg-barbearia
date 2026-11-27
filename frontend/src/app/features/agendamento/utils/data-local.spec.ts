import { dataLocal } from './data-local';

describe('dataLocal', () => {
  it('converte um instante UTC para a data e os minutos no fuso America/Recife', () => {
    const resultado = dataLocal(new Date('2026-11-28T12:30:00.000Z'));

    expect(resultado).toEqual({
      data: '2026-11-28',
      minutos: 570,
    });
  });

  it('mantém a data local anterior quando o dia UTC já virou', () => {
    const resultado = dataLocal(new Date('2026-11-29T02:59:59.000Z'));

    expect(resultado.data).toBe('2026-11-28');
    expect(resultado.minutos).toBeCloseTo(23 * 60 + 59 + 59 / 60, 10);
  });

  it('retorna zero minutos na meia-noite local e respeita virada de ano', () => {
    expect(dataLocal(new Date('2026-11-29T03:00:00.000Z'))).toEqual({
      data: '2026-11-29',
      minutos: 0,
    });
    expect(dataLocal(new Date('2027-01-01T02:30:00.000Z'))).toEqual({
      data: '2026-12-31',
      minutos: 1410,
    });
  });

  it('inclui frações de segundos e milissegundos no cálculo dos minutos', () => {
    const comSegundos = dataLocal(new Date('2026-11-28T13:15:30.000Z'));
    const comMilissegundos = dataLocal(new Date('2026-11-28T13:15:30.500Z'));
    const apenasMilissegundos = dataLocal(new Date('2026-11-28T03:00:00.600Z'));

    expect(comSegundos.minutos).toBe(615.5);
    expect(comMilissegundos.minutos).toBeCloseTo(615 + 30.5 / 60, 10);
    expect(apenasMilissegundos.minutos).toBeCloseTo(0.01, 10);
  });
});
