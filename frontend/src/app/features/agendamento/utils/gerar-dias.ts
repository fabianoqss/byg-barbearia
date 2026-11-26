import { BARBEARIA } from '../../../shared/constants/barbearia';
import { IntervaloHorario } from '../../../shared/models/intervalo-horario';
import { dataLocal } from './data-local';

export interface DiaAgendamento {
  readonly data: string;
  readonly semana: string;
  readonly numero: string;
  readonly rotuloCompleto: string;
  readonly expediente: IntervaloHorario;
}

const QUANTIDADE_DIAS = 6;
const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const FORMATO_DIA_COMPLETO = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'full',
  timeZone: 'UTC',
});

export function gerarDias(agora: Date): DiaAgendamento[] {
  const data = new Date(`${dataLocal(agora).data}T00:00:00Z`);
  const dias: DiaAgendamento[] = [];

  for (let i = 0; i < QUANTIDADE_DIAS * 7 && dias.length < QUANTIDADE_DIAS; i++) {
    const diaDaSemana = data.getUTCDay();
    const expediente = BARBEARIA.horarios.find(({ dias }) =>
      dias.includes(diaDaSemana),
    )?.expediente;

    if (expediente) {
      const dataIso = data.toISOString().slice(0, 10);
      dias.push({
        data: dataIso,
        semana: DIAS_DA_SEMANA[diaDaSemana],
        numero: dataIso.slice(-2),
        rotuloCompleto: FORMATO_DIA_COMPLETO.format(data),
        expediente,
      });
    }

    data.setUTCDate(data.getUTCDate() + 1);
  }

  return dias;
}
