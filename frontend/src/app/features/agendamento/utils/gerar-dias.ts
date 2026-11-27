import { BARBEARIA } from '../../../shared/constants/barbearia';
import { IntervaloHorario } from '../../../shared/models/intervalo-horario';
import { dataLocal } from './data-local';

export interface DiaAgendamento {
  readonly data: string;
  readonly semana: string;
  readonly numero: string;
  readonly rotuloCompleto: string;
  readonly expediente: IntervaloHorario | null;
}

const QUANTIDADE_DIAS = 6;
const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const FORMATO_DIA_COMPLETO = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'full',
  timeZone: 'UTC',
});

export function criarDiaAgendamento(dataIso: string, agora: Date): DiaAgendamento | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataIso)) {
    return null;
  }

  const data = new Date(`${dataIso}T00:00:00Z`);
  if (
    Number.isNaN(data.getTime()) ||
    data.toISOString().slice(0, 10) !== dataIso ||
    dataIso < dataLocal(agora).data
  ) {
    return null;
  }

  const diaDaSemana = data.getUTCDay();
  const horario = BARBEARIA.horarios.find(({ dias }) => dias.includes(diaDaSemana));
  if (!horario) {
    return null;
  }

  return {
    data: dataIso,
    semana: DIAS_DA_SEMANA[diaDaSemana],
    numero: dataIso.slice(-2),
    rotuloCompleto: FORMATO_DIA_COMPLETO.format(data),
    expediente: horario.expediente,
  };
}

export function gerarDias(agora: Date): DiaAgendamento[] {
  const data = new Date(`${dataLocal(agora).data}T00:00:00Z`);
  const dias: DiaAgendamento[] = [];

  for (let i = 0; i < QUANTIDADE_DIAS * 7 && dias.length < QUANTIDADE_DIAS; i++) {
    const dia = criarDiaAgendamento(data.toISOString().slice(0, 10), agora);

    if (dia?.expediente) {
      dias.push(dia);
    }

    data.setUTCDate(data.getUTCDate() + 1);
  }

  return dias;
}
