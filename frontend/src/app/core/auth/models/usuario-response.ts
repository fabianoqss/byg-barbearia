import { Papel } from '../../../shared/models/usuario';

export interface UsuarioResponse {
  readonly id: number;
  readonly nome: string;
  readonly email: string;
  readonly papel: Papel;
}
