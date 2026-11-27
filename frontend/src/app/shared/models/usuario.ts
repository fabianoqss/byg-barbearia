export type Papel = 'CLIENTE' | 'BARBEIRO';

export interface Usuario {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly papel: Papel;
}
