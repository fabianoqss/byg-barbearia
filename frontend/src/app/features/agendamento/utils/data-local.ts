import { BARBEARIA } from '../../../shared/constants/barbearia';

const FORMATO_DATA_LOCAL = new Intl.DateTimeFormat('en-GB', {
  timeZone: BARBEARIA.fusoHorario,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function dataLocal(referencia: Date): { data: string; minutos: number } {
  const campos = new Map(
    FORMATO_DATA_LOCAL.formatToParts(referencia).map(({ type, value }) => [type, value]),
  );
  const data = `${campos.get('year')}-${campos.get('month')}-${campos.get('day')}`;
  const minutos =
    Number(campos.get('hour')) * 60 +
    Number(campos.get('minute')) +
    (Number(campos.get('second')) + referencia.getUTCMilliseconds() / 1000) / 60;

  return { data, minutos };
}
