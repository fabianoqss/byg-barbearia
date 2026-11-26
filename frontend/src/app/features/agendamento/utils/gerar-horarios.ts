import { IntervaloHorario } from '../../../shared/models/intervalo-horario';
import { dataLocal } from './data-local';
import { DiaAgendamento } from './gerar-dias';

export interface HorarioAgendamento {
  readonly hora: string;
  readonly ocupado: boolean;
}

const PASSO_MINUTOS = 30;

function horaEmMinutos(horario: string): number {
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
}

export function gerarHorarios(
  dia: DiaAgendamento,
  duracaoMinutos: number,
  agora: Date,
  ocupados: readonly IntervaloHorario[] = [],
): HorarioAgendamento[] {
  const hoje = dataLocal(agora);
  if (dia.data < hoje.data) {
    return [];
  }

  const abertura = horaEmMinutos(dia.expediente.inicio);
  const fechamento = horaEmMinutos(dia.expediente.fim);
  const intervalos = ocupados.map(({ inicio, fim }) => ({
    inicio: horaEmMinutos(inicio),
    fim: horaEmMinutos(fim),
  }));
  const horarios: HorarioAgendamento[] = [];

  for (let inicio = abertura; inicio + duracaoMinutos <= fechamento; inicio += PASSO_MINUTOS) {
    if (dia.data === hoje.data && inicio < hoje.minutos) {
      continue;
    }

    const fim = inicio + duracaoMinutos;
    const horas = String(Math.floor(inicio / 60)).padStart(2, '0');
    const minutos = String(inicio % 60).padStart(2, '0');
    horarios.push({
      hora: `${horas}:${minutos}`,
      ocupado: intervalos.some((intervalo) => inicio < intervalo.fim && intervalo.inicio < fim),
    });
  }

  return horarios;
}
