import { HorarioFuncionamento } from '../models/horario-funcionamento';

const HORARIOS: readonly HorarioFuncionamento[] = [
  {
    rotulo: 'Segunda a sexta',
    dias: [1, 2, 3, 4, 5],
    expediente: { inicio: '09:00', fim: '18:00' },
  },
  { rotulo: 'Sábado', dias: [6], expediente: { inicio: '08:30', fim: '16:00' } },
  { rotulo: 'Domingo', dias: [0], expediente: null },
];

export const BARBEARIA = {
  nome: 'BYG Barbearia',
  endereco: 'R. Joaquim Pires Ferreira, 190, Sala 101 – Estados, João Pessoa – PB, 58030-224',
  horarioFuncionamento: 'Seg–Sáb · 8h–18h',
  enderecoLinhas: [
    'Rua Joaquim Pires Ferreira, 190, sala 101',
    'Estados, João Pessoa – PB',
    '58030-224',
  ],
  bairroCidade: 'Estados · João Pessoa',
  mapaUrl: 'https://maps.google.com/?q=Rua+Joaquim+Pires+Ferreira+190+Joao+Pessoa',
  whatsApp: { url: 'https://wa.me/5583998739640', telefone: '(83) 99873-9640' },
  avaliacao: { nota: '5,0', total: 4 },
  comodidades: ['Wi-Fi', 'Estacionamento grátis', 'Adultos e crianças', 'TV', 'Aceita cartão'],
  fusoHorario: 'America/Recife',
  horarios: HORARIOS,
} as const;
