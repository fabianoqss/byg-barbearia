import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duracao' })
export class Duracao implements PipeTransform {
  transform(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);
    const restante = minutos % 60;
    return restante ? `${horas} h ${restante} min` : `${horas} h`;
  }
}
