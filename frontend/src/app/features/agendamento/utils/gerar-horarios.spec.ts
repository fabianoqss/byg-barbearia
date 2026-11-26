import { gerarDias } from './gerar-dias';
import { gerarHorarios } from './gerar-horarios';

describe('gerarHorarios', () => {
  it('gera horários de sábado a partir de 08:30 até o último que cabe no expediente', () => {
    const agora = new Date('2026-11-28T11:00:00Z');
    const [sabado] = gerarDias(agora);
    const horarios = gerarHorarios(sabado, 30, agora);

    expect(horarios).toHaveLength(15);
    expect(horarios.slice(0, 2).map(({ hora }) => hora)).toEqual(['08:30', '09:00']);
    expect(horarios.at(-1)?.hora).toBe('15:30');
  });

  it('só oferece horários com tempo para concluir o serviço antes de fechar', () => {
    const agora = new Date('2026-11-26T11:00:00Z');
    const [quinta] = gerarDias(agora);
    const horarios = gerarHorarios(quinta, 60, agora);

    expect(horarios.at(-1)?.hora).toBe('17:00');
    expect(horarios.some(({ hora }) => hora === '17:30')).toBe(false);
  });

  it('oculta horários passados de hoje e mantém os horários de amanhã', () => {
    const agora = new Date('2026-11-26T13:30:01Z');
    const [quinta, sexta] = gerarDias(agora);

    expect(gerarHorarios(quinta, 30, agora)[0].hora).toBe('11:00');
    expect(gerarHorarios(sexta, 30, agora)[0].hora).toBe('09:00');
  });

  it('marca como ocupado qualquer horário que sobreponha um intervalo indisponível', () => {
    const agora = new Date('2026-11-26T11:00:00Z');
    const [quinta] = gerarDias(agora);
    const horarios = gerarHorarios(quinta, 60, agora, [{ inicio: '10:00', fim: '10:30' }]);

    expect(horarios.filter(({ ocupado }) => ocupado).map(({ hora }) => hora)).toEqual([
      '09:30',
      '10:00',
    ]);
  });
});
