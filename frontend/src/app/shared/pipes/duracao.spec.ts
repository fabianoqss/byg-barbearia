import { Duracao } from './duracao';

describe('Duracao', () => {
  const pipe = new Duracao();

  it('formata valores menores que 60 minutos apenas em minutos', () => {
    expect(pipe.transform(1)).toBe('1 min');
    expect(pipe.transform(30)).toBe('30 min');
    expect(pipe.transform(59)).toBe('59 min');
  });

  it('formata zero minutos como 0 min', () => {
    expect(pipe.transform(0)).toBe('0 min');
  });

  it('formata horas exatas sem exibir minutos', () => {
    expect(pipe.transform(60)).toBe('1 h');
    expect(pipe.transform(120)).toBe('2 h');
  });

  it('formata horas com minutos restantes', () => {
    expect(pipe.transform(61)).toBe('1 h 1 min');
    expect(pipe.transform(75)).toBe('1 h 15 min');
    expect(pipe.transform(135)).toBe('2 h 15 min');
  });
});
