import { FormControl } from '@angular/forms';
import { emailOuTelefoneValidator } from './email-ou-telefone.validator';

function validar(valor: string) {
  return emailOuTelefoneValidator(new FormControl(valor, { nonNullable: true }));
}

describe('emailOuTelefoneValidator', () => {
  it.each(['cliente@email.com', '  barbeiro@byg.com.br  '])('aceita o e-mail %s', (valor) => {
    expect(validar(valor)).toBeNull();
  });

  it.each(['(83) 9 0000-0000', '83900000000', '+55 83 98888-7777', '(83) 3222-1111'])(
    'aceita o telefone %s',
    (valor) => {
      expect(validar(valor)).toBeNull();
    },
  );

  it('ignora valor vazio, que fica a cargo do required', () => {
    expect(validar('')).toBeNull();
  });

  it.each(['cliente', 'cliente@email', '12345', '(83) 9 0000-000', '(03) 9 0000-0000', '83 9abc-0000'])(
    'rejeita %s',
    (valor) => {
      expect(validar(valor)).toEqual({ emailOuTelefone: true });
    },
  );
});
