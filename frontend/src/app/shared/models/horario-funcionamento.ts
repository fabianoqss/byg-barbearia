import { IntervaloHorario } from './intervalo-horario';

export interface HorarioFuncionamento {
  readonly rotulo: string;
  readonly dias: readonly number[];
  readonly expediente: IntervaloHorario | null;
}
