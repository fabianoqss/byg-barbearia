import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BARBEARIA } from '../../shared/constants/barbearia';
import { BARBEIROS } from '../../shared/constants/barbeiros';
import { SERVICOS } from '../../shared/constants/servicos';
import { Duracao } from '../../shared/pipes/duracao';

@Component({
  selector: 'byg-inicio',
  imports: [CurrencyPipe, Duracao, RouterLink],
  templateUrl: './inicio.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inicio {
  protected readonly barbearia = BARBEARIA;
  protected readonly barbeiros = BARBEIROS;
  protected readonly servicos = SERVICOS;
}
