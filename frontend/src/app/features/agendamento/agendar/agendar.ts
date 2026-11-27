import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { distinctUntilChanged, map, startWith, timer } from 'rxjs';
import { BARBEIROS } from '../../../shared/constants/barbeiros';
import { SERVICOS } from '../../../shared/constants/servicos';
import { Barbeiro } from '../../../shared/models/barbeiro';
import { Servico } from '../../../shared/models/servico';
import { Duracao } from '../../../shared/pipes/duracao';
import { dataLocal } from '../utils/data-local';
import { criarDiaAgendamento, DiaAgendamento, gerarDias } from '../utils/gerar-dias';
import { gerarHorarios } from '../utils/gerar-horarios';

const QUALQUER_BARBEIRO: Barbeiro = { id: 'qualquer', nome: 'Qualquer', iniciais: '★' };
const MINUTO_EM_MS = 60_000;

@Component({
  selector: 'byg-agendar',
  imports: [CurrencyPipe, Duracao, RouterLink],
  templateUrl: './agendar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Agendar {
  private readonly servicoNaUrl = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(
      map((parametros) => parametros.get('servico')),
      distinctUntilChanged(),
    ),
    { requireSync: true },
  );

  private readonly agora = toSignal(
    timer(MINUTO_EM_MS - (Date.now() % MINUTO_EM_MS) + 1, MINUTO_EM_MS).pipe(
      map(() => new Date()),
      startWith(new Date()),
    ),
    { requireSync: true },
  );

  protected readonly servicos = SERVICOS;
  protected readonly barbeiros = [QUALQUER_BARBEIRO, ...BARBEIROS];
  protected readonly dias = computed(() => gerarDias(this.agora()));
  protected readonly dataMinima = computed(() => dataLocal(this.agora()).data);

  protected readonly servicoSelecionado = linkedSignal<Servico>(() => {
    const id = this.servicoNaUrl();
    return this.servicos.find((servico) => servico.id === id) ?? this.servicos[0];
  });

  protected readonly barbeiroSelecionado = signal(QUALQUER_BARBEIRO);

  protected readonly diaSelecionado = linkedSignal<string, DiaAgendamento | null>({
    source: this.dataMinima,
    computation: (hoje, anterior) =>
      (anterior?.value?.data && anterior.value.data >= hoje
        ? criarDiaAgendamento(anterior.value.data, this.agora())
        : null) ??
      this.dias().find((dia) => this.horariosDoDia(dia).some((horario) => !horario.ocupado)) ??
      this.dias()[0] ??
      null,
  });

  protected selecionarData(data: string, campo: HTMLInputElement): void {
    const dia = criarDiaAgendamento(data, this.agora());
    if (dia) {
      this.diaSelecionado.set(dia);
      return;
    }

    campo.value = this.diaSelecionado()?.data ?? '';
  }

  protected readonly horarios = computed(() => {
    const dia = this.diaSelecionado();
    return dia ? this.horariosDoDia(dia) : [];
  });

  protected readonly horarioSelecionado = linkedSignal({
    source: () => ({ data: this.diaSelecionado()?.data, horarios: this.horarios() }),
    computation: ({ data, horarios }, anterior): string | null => {
      if (
        anterior &&
        anterior.source.data === data &&
        horarios.some(({ hora, ocupado }) => !ocupado && hora === anterior.value)
      ) {
        return anterior.value;
      }
      return null;
    },
  });

  protected readonly resumo = computed(() => {
    const servico = this.servicoSelecionado();
    const dia = this.diaSelecionado();
    const horario = this.horarioSelecionado();
    const dataCompacta = dia
      ? ` · ${dia.semana} ${dia.numero}/${dia.data.slice(5, 7)}/${dia.data.slice(0, 4)}`
      : '';
    const horaCompacta = horario ? ` às ${horario}` : '';

    return {
      servico: servico.nome,
      barbeiro: this.barbeiroSelecionado().nome,
      dia: dia?.rotuloCompleto ?? '—',
      horario: horario ?? '—',
      preco: servico.preco,
      textoCompacto: `${servico.nome}${dataCompacta}${horaCompacta}`,
    };
  });

  protected readonly cta = computed(() =>
    this.horarioSelecionado()
      ? { habilitado: true, texto: 'Confirmar agendamento' }
      : { habilitado: false, texto: 'Escolha um horário' },
  );

  protected confirmar(): void {}

  private horariosDoDia(dia: DiaAgendamento) {
    return gerarHorarios(dia, this.servicoSelecionado().duracaoMinutos, this.agora());
  }
}
