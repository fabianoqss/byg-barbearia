import { CurrencyPipe, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  private readonly documento = inject(DOCUMENT);
  private readonly router = inject(Router);

  protected readonly barbearia = BARBEARIA;
  protected readonly barbeiros = BARBEIROS;
  protected readonly servicos = SERVICOS;

  protected rolarPara(fragmento: string): void {
    if (this.router.parseUrl(this.router.url).fragment !== fragmento) {
      return;
    }

    this.documento.getElementById(fragmento)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}
