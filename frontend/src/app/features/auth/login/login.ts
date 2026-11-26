import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BARBEARIA } from '../../../shared/constants/barbearia';
import { emailOuTelefoneValidator } from '../validators/email-ou-telefone.validator';

type CampoLogin = 'login' | 'senha';

@Component({
  selector: 'byg-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly barbearia = BARBEARIA;
  protected readonly senhaVisivel = signal(false);

  protected readonly form = this.formBuilder.group({
    login: ['', [Validators.required, emailOuTelefoneValidator]],
    senha: ['', Validators.required],
    manterConectado: [false],
  });

  protected alternarVisibilidadeSenha(): void {
    this.senhaVisivel.update((visivel) => !visivel);
  }

  protected campoInvalido(campo: CampoLogin): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  protected entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
  }
}
