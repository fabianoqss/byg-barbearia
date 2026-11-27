import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { CredenciaisLogin } from './models/credenciais-login';
import { UsuarioResponse } from './models/usuario-response';
import { Papel, Usuario } from '../../shared/models/usuario';

const CABECALHOS_LOGIN = new HttpHeaders({
  'Content-Type': 'application/x-www-form-urlencoded',
});

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly usuarioAtual = signal<Usuario | null>(null);

  readonly usuario = this.usuarioAtual.asReadonly();
  readonly autenticado = computed(() => this.usuarioAtual() !== null);
  readonly papel = computed<Papel | null>(() => this.usuarioAtual()?.papel ?? null);

  login(credenciais: CredenciaisLogin): Observable<Usuario> {
    const corpo = new URLSearchParams({
      username: credenciais.username,
      password: credenciais.password,
      'remember-me': credenciais.rememberMe ? 'true' : 'false',
    });

    return this.http
      .post<UsuarioResponse>('/api/auth/login', corpo.toString(), { headers: CABECALHOS_LOGIN })
      .pipe(map((resposta) => this.definirUsuario(resposta)));
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', null).pipe(tap(() => this.limparSessao()));
  }

  carregarSessao(): Observable<Usuario | null> {
    return this.http.get<UsuarioResponse>('/api/auth/me').pipe(
      map((resposta) => this.definirUsuario(resposta)),
      catchError((erro: unknown) => {
        this.limparSessao();
        if (erro instanceof HttpErrorResponse && erro.status === 401) {
          return of(null);
        }
        return throwError(() => erro);
      }),
    );
  }

  limparSessao(): void {
    this.usuarioAtual.set(null);
  }

  private definirUsuario(resposta: UsuarioResponse): Usuario {
    const usuario: Usuario = {
      id: resposta.id,
      nome: resposta.nome,
      email: resposta.email,
      papel: resposta.papel,
    };
    this.usuarioAtual.set(usuario);
    return usuario;
  }
}
