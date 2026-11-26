import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARACTERES_DE_TELEFONE = /^[\d\s()+-]+$/;
const TELEFONE_BRASILEIRO = /^(?:55)?[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/;

export const emailOuTelefoneValidator: ValidatorFn = (
  control: AbstractControl<string>,
): ValidationErrors | null => {
  const valor = (control.value ?? '').trim();

  if (!valor || EMAIL.test(valor) || ehTelefoneBrasileiro(valor)) {
    return null;
  }

  return { emailOuTelefone: true };
};

function ehTelefoneBrasileiro(valor: string): boolean {
  return CARACTERES_DE_TELEFONE.test(valor) && TELEFONE_BRASILEIRO.test(valor.replace(/\D/g, ''));
}
