import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { BARBEARIA } from '../../../shared/constants/barbearia';
import { validarRetornoInterno } from '../utils/validar-retorno-interno';
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);

  protected readonly barbearia = BARBEARIA;
  protected readonly senhaVisivel = signal(false);
  protected readonly carregando = signal(false);
  protected readonly erroLogin = signal<string | null>(null);

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
      return;
    }

    if (this.carregando()) {
      return;
    }

    this.erroLogin.set(null);
    this.carregando.set(true);
    const login = this.form.controls.login.value.trim();
    const username = login.includes('@') ? login : login.replace(/\D/g, '');

    this.authService
      .login({
        username,
        password: this.form.controls.senha.value,
        rememberMe: this.form.controls.manterConectado.value,
      })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => {
          const retorno = validarRetornoInterno(this.rota.snapshot.queryParamMap.get('returnUrl'));
          void this.router.navigateByUrl(retorno);
        },
        error: (erro: unknown) => {
          this.erroLogin.set(
            erro instanceof HttpErrorResponse && erro.status === 401
              ? 'E-mail/telefone ou senha inválidos'
              : 'Não foi possível entrar no momento. Tente novamente.',
          );
        },
      });
  }
}
