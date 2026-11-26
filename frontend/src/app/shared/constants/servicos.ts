import { Servico } from '../models/servico';

export const SERVICOS = [
  { id: 'corte', nome: 'Corte', duracaoMinutos: 30, preco: 40 },
  { id: 'barba', nome: 'Barba', duracaoMinutos: 30, preco: 40 },
  { id: 'corte-barba', nome: 'Corte + Barba', duracaoMinutos: 60, preco: 80 },
] as const satisfies readonly [Servico, ...Servico[]];
